"""Windows launcher for the Service Billing System demo.

This launcher starts the existing Node/Express app, waits for localhost:3000,
and opens the user's default browser. It does not replace Node.js, Express,
SQL Server, or any Service Billing System business logic.
"""

from __future__ import annotations

import logging
import os
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import tkinter as tk
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path
from tkinter import messagebox


APP_URL = "http://localhost:3000"
APP_HOST = "localhost"
APP_PORT = 3000
REQUEST_TIMEOUT_SECONDS = 2
STARTUP_TIMEOUT_SECONDS = 45

LAUNCHER_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = LAUNCHER_DIR.parents[1]
LOG_DIR = LAUNCHER_DIR / "logs"
LOG_FILE = LOG_DIR / "launcher.log"
PID_FILE = LOG_DIR / "server.pid"


def configure_logging() -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        filename=LOG_FILE,
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        encoding="utf-8",
    )


def get_npm_command() -> str | None:
    return shutil.which("npm.cmd") or shutil.which("npm")


def url_is_ready() -> bool:
    try:
        with urllib.request.urlopen(APP_URL, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            return 200 <= response.status < 500
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def port_is_open() -> bool:
    try:
        with socket.create_connection((APP_HOST, APP_PORT), timeout=REQUEST_TIMEOUT_SECONDS):
            return True
    except OSError:
        return False


def wait_for_server(timeout_seconds: int = STARTUP_TIMEOUT_SECONDS) -> bool:
    deadline = time.time() + timeout_seconds

    while time.time() < deadline:
        if url_is_ready():
            return True
        time.sleep(1)

    return False


def read_pid_file() -> int | None:
    try:
        return int(PID_FILE.read_text(encoding="utf-8").strip())
    except (FileNotFoundError, ValueError, OSError):
        return None


def write_pid_file(pid: int) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    PID_FILE.write_text(str(pid), encoding="utf-8")


def clear_pid_file() -> None:
    try:
        PID_FILE.unlink()
    except FileNotFoundError:
        pass
    except OSError as error:
        logging.warning("Could not remove PID file: %s", error)


def process_is_alive(pid: int) -> bool:
    if pid <= 0:
        return False

    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def stop_windows_process_tree(pid: int) -> bool:
    if pid <= 0:
        return False

    try:
        result = subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        logging.info("taskkill result for PID %s: %s %s", pid, result.returncode, result.stdout.strip())
        return result.returncode == 0
    except (OSError, subprocess.SubprocessError) as error:
        logging.exception("Could not stop process tree for PID %s: %s", pid, error)
        return False


def check_sql_server() -> tuple[bool | None, str]:
    """Return (status, message). None means the check could not be performed."""

    sqlcmd = shutil.which("sqlcmd")
    if not sqlcmd:
        return None, "sqlcmd no esta disponible; se omitio la verificacion de SQL Server."

    db_server = os.environ.get("DB_SERVER", "localhost")
    db_name = os.environ.get("DB_NAME", "ServiceBillingDB")
    db_user = os.environ.get("DB_USER")
    db_password = os.environ.get("DB_PASSWORD")

    command = [sqlcmd, "-S", db_server, "-d", db_name, "-C", "-Q", "SELECT 1", "-b"]
    if db_user and db_password:
        command.extend(["-U", db_user, "-P", db_password])
    else:
        command.append("-E")

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=8,
            check=False,
        )
        if result.returncode == 0:
            return True, "SQL Server respondio correctamente."

        logging.warning("SQL check failed: %s %s", result.stdout.strip(), result.stderr.strip())
        return False, "SQL Server no respondio. Verifica que ServiceBillingDB este disponible."
    except subprocess.TimeoutExpired:
        return False, "SQL Server no respondio a tiempo."
    except OSError as error:
        logging.exception("SQL check failed with OS error: %s", error)
        return None, "No se pudo verificar SQL Server desde el launcher."


class ServiceBillingLauncher(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Solutions By Design - Launcher")
        self.geometry("460x290")
        self.minsize(420, 270)
        self.server_process: subprocess.Popen[str] | None = None
        self.server_log_handle = None
        self.is_busy = False

        self.status_var = tk.StringVar(value="Servidor detenido")
        self.detail_var = tk.StringVar(value="Listo para iniciar el sistema.")

        self._build_ui()
        self.refresh_status()

    def _build_ui(self) -> None:
        self.configure(bg="#0f172a")

        container = tk.Frame(self, bg="#0f172a", padx=22, pady=20)
        container.pack(fill=tk.BOTH, expand=True)

        title = tk.Label(
            container,
            text="Solutions By Design",
            bg="#0f172a",
            fg="#f8fafc",
            font=("Segoe UI", 18, "bold"),
            anchor="w",
        )
        title.pack(fill=tk.X)

        subtitle = tk.Label(
            container,
            text="Launcher de demostracion del Service Billing System",
            bg="#0f172a",
            fg="#cbd5e1",
            font=("Segoe UI", 10),
            anchor="w",
        )
        subtitle.pack(fill=tk.X, pady=(2, 18))

        status_card = tk.Frame(container, bg="#172033", padx=14, pady=12, highlightthickness=1, highlightbackground="#334155")
        status_card.pack(fill=tk.X, pady=(0, 16))

        tk.Label(
            status_card,
            textvariable=self.status_var,
            bg="#172033",
            fg="#86efac",
            font=("Segoe UI", 11, "bold"),
            anchor="w",
        ).pack(fill=tk.X)

        tk.Label(
            status_card,
            textvariable=self.detail_var,
            bg="#172033",
            fg="#cbd5e1",
            font=("Segoe UI", 9),
            anchor="w",
            wraplength=390,
            justify=tk.LEFT,
        ).pack(fill=tk.X, pady=(4, 0))

        button_grid = tk.Frame(container, bg="#0f172a")
        button_grid.pack(fill=tk.X)
        button_grid.columnconfigure((0, 1, 2), weight=1, uniform="actions")

        self.open_button = self._make_button(button_grid, "Abrir sistema", self.open_system)
        self.restart_button = self._make_button(button_grid, "Reiniciar servidor", self.restart_server)
        self.close_button = self._make_button(button_grid, "Cerrar servidor", self.close_server)

        self.open_button.grid(row=0, column=0, sticky="ew", padx=(0, 8))
        self.restart_button.grid(row=0, column=1, sticky="ew", padx=4)
        self.close_button.grid(row=0, column=2, sticky="ew", padx=(8, 0))

        log_note = tk.Label(
            container,
            text=f"Logs tecnicos: {LOG_FILE}",
            bg="#0f172a",
            fg="#94a3b8",
            font=("Segoe UI", 8),
            anchor="w",
            wraplength=400,
            justify=tk.LEFT,
        )
        log_note.pack(fill=tk.X, pady=(18, 0))

    def _make_button(self, parent: tk.Widget, text: str, command) -> tk.Button:
        return tk.Button(
            parent,
            text=text,
            command=command,
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            activeforeground="#ffffff",
            relief=tk.FLAT,
            padx=10,
            pady=10,
            font=("Segoe UI", 9, "bold"),
            cursor="hand2",
        )

    def set_busy(self, busy: bool) -> None:
        self.is_busy = busy
        state = tk.DISABLED if busy else tk.NORMAL
        self.open_button.configure(state=state)
        self.restart_button.configure(state=state)
        self.close_button.configure(state=state)

    def set_status(self, status: str, detail: str = "") -> None:
        self.status_var.set(status)
        self.detail_var.set(detail)

    def run_background(self, target) -> None:
        if self.is_busy:
            return

        self.set_busy(True)

        def runner() -> None:
            try:
                target()
            finally:
                self.after(0, lambda: self.set_busy(False))

        threading.Thread(target=runner, daemon=True).start()

    def refresh_status(self) -> None:
        if url_is_ready():
            self.set_status("Servidor iniciado", "El sistema esta respondiendo en localhost:3000.")
        elif port_is_open():
            self.set_status("Error de conexion", "El puerto 3000 esta ocupado, pero el sistema no respondio correctamente.")
        else:
            self.set_status("Servidor detenido", "Listo para iniciar el sistema.")

    def open_system(self) -> None:
        self.run_background(self._open_system)

    def restart_server(self) -> None:
        self.run_background(self._restart_server)

    def close_server(self) -> None:
        self.run_background(self._close_server)

    def _open_system(self) -> None:
        logging.info("Open system requested.")
        self.after(0, lambda: self.set_status("Servidor iniciado", "Verificando el servidor..."))

        if url_is_ready():
            logging.info("Server already running; opening browser.")
            self.after(0, lambda: self.set_status("Servidor iniciado", "El servidor ya estaba iniciado. Abriendo navegador..."))
            webbrowser.open(APP_URL)
            self._update_sql_status_after_open()
            return

        if port_is_open():
            logging.warning("Port 3000 is open but app did not respond.")
            self.after(0, lambda: self.set_status("Error de conexion", "El puerto 3000 esta ocupado por otro programa."))
            self.after(0, lambda: messagebox.showerror("Puerto ocupado", "El puerto 3000 esta ocupado y el sistema no respondio. Cierra el otro programa o reinicia la computadora."))
            return

        npm_command = get_npm_command()
        if not npm_command:
            logging.error("npm command was not found.")
            self.after(0, lambda: self.set_status("Error de conexion", "npm no esta disponible."))
            self.after(0, lambda: messagebox.showerror("npm no disponible", "No se encontro npm. Instala Node.js o verifica que npm este en el PATH."))
            return

        try:
            logging.info("Starting server with %s start in %s", npm_command, PROJECT_ROOT)
            self.after(0, lambda: self.set_status("Servidor iniciado", "Iniciando servidor, espera unos segundos..."))
            self.server_log_handle = LOG_FILE.open("a", encoding="utf-8")
            self.server_log_handle.write("\n--- npm start ---\n")
            self.server_log_handle.flush()
            self.server_process = subprocess.Popen(
                [npm_command, "start"],
                cwd=PROJECT_ROOT,
                stdout=self.server_log_handle,
                stderr=subprocess.STDOUT,
                text=True,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform.startswith("win") else 0,
            )
            write_pid_file(self.server_process.pid)
        except OSError as error:
            self._close_server_log_handle()
            logging.exception("Could not start npm: %s", error)
            self.after(0, lambda: self.set_status("Error de conexion", "No se pudo iniciar el servidor."))
            self.after(0, lambda: messagebox.showerror("Error al iniciar", "No se pudo iniciar el servidor. Revisa que Node.js y npm esten instalados."))
            return

        if wait_for_server():
            logging.info("Server responded successfully.")
            self.after(0, lambda: self.set_status("Servidor iniciado", "Servidor listo. Abriendo navegador..."))
            webbrowser.open(APP_URL)
            self._update_sql_status_after_open()
            return

        logging.error("Server did not respond before timeout.")
        self.after(0, lambda: self.set_status("Error de conexion", "El servidor no inicio a tiempo."))
        self.after(0, lambda: messagebox.showerror("Servidor no iniciado", "El servidor no respondio a tiempo. Revisa los logs del launcher."))

    def _restart_server(self) -> None:
        logging.info("Restart requested.")
        self._close_server(show_messages=False)
        time.sleep(1)
        self._open_system()

    def _close_server(self, show_messages: bool = True) -> None:
        logging.info("Close server requested.")
        pid = self.server_process.pid if self.server_process and self.server_process.poll() is None else read_pid_file()

        if not pid or not process_is_alive(pid):
            clear_pid_file()
            self.server_process = None
            self._close_server_log_handle()
            self.after(0, lambda: self.set_status("Servidor detenido", "No hay servidor iniciado por este launcher."))
            if show_messages and url_is_ready():
                self.after(0, lambda: messagebox.showinfo("Servidor externo", "El sistema parece estar iniciado fuera del launcher. No se cerro automaticamente para evitar cerrar otro proceso."))
            return

        stopped = stop_windows_process_tree(pid) if sys.platform.startswith("win") else self._terminate_process(pid)
        clear_pid_file()
        self.server_process = None
        self._close_server_log_handle()

        if stopped:
            self.after(0, lambda: self.set_status("Servidor detenido", "Servidor cerrado correctamente."))
            if show_messages:
                self.after(0, lambda: messagebox.showinfo("Servidor cerrado", "El servidor se cerro correctamente."))
        else:
            self.after(0, lambda: self.set_status("Error de conexion", "No se pudo cerrar el servidor desde el launcher."))
            if show_messages:
                self.after(0, lambda: messagebox.showwarning("No se pudo cerrar", "No se pudo cerrar el servidor automaticamente. Revisa si fue iniciado por otra ventana."))

    def _terminate_process(self, pid: int) -> bool:
        try:
            os.kill(pid, signal.SIGTERM)
            return True
        except OSError as error:
            logging.exception("Could not terminate PID %s: %s", pid, error)
            return False

    def _close_server_log_handle(self) -> None:
        if not self.server_log_handle:
            return

        try:
            self.server_log_handle.close()
        except OSError as error:
            logging.warning("Could not close server log handle: %s", error)
        finally:
            self.server_log_handle = None

    def _update_sql_status_after_open(self) -> None:
        sql_status, sql_message = check_sql_server()
        logging.info("SQL status after open: %s - %s", sql_status, sql_message)

        if sql_status is False:
            self.after(0, lambda: self.set_status("Error de conexion", sql_message))
            self.after(0, lambda: messagebox.showwarning("SQL Server", sql_message))
        elif sql_status is True:
            self.after(0, lambda: self.set_status("Servidor iniciado", "Servidor iniciado y SQL Server respondio correctamente."))
        else:
            self.after(0, lambda: self.set_status("Servidor iniciado", "Servidor iniciado. SQL Server no fue verificado automaticamente."))


def main() -> None:
    configure_logging()
    logging.info("Launcher started. Project root: %s", PROJECT_ROOT)
    app = ServiceBillingLauncher()
    app.mainloop()


if __name__ == "__main__":
    main()
