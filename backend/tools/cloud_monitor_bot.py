import asyncio
import subprocess
import re
import requests
import logging
from telegram import Bot
from telegram.ext import Application, CommandHandler, ContextTypes
import time

# Settings
BOT_TOKEN = "8517209446:AAHsxm0FjlIOyDCQbloAkaP_yTzlOjzVyhg"
CHAT_ID = "8310047291"
LOCAL_URL = "http://localhost:80"
CHECK_INTERVAL = 60 #time between checks in seconds
FAILURE_LIMIT = 1  #number of consecutive failures before restart

# logging
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class TunnelManager:
    def __init__(self, bot_token, chat_id, local_url):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.local_url = local_url
        self.current_url = None
        self.process = None
        self.is_running = False
        self.bot = Bot(token=bot_token)
        
    async def send_telegram_message(self, message):
        """
        Sends a message to Telegram
        """
        try:
            await self.bot.send_message(chat_id=self.chat_id, text=message)
            logger.info(f"Mensaje enviado: {message}")
        except Exception as e:
            logger.error(f"Error enviando mensaje: {e}")
    
    def start_tunnel(self):
        """
        Starts a new cloudflared tunnel wirh command and retrieves the URL
        """
        try:
            logger.info("Iniciando nuevo tunnel...")
            
            # KIll existing process if running
            if self.process and self.process.poll() is None:
                self.process.terminate()
                self.process.wait()
            
            # Start cloudflared process
            self.process = subprocess.Popen(
                ['cloudflared', 'tunnel', '--url', self.local_url],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
            
            # Get URL from output
            start_time = time.time()
            while time.time() - start_time < 30:  # 30 seconds TO
                line = self.process.stdout.readline()
                if not line:
                    time.sleep(0.1)
                    continue
                
                logger.debug(f"Cloudflared: {line.strip()}")
                
                if 'trycloudflare.com' in line:
                    match = re.search(
                        r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', 
                        line)
                    if match:
                        new_url = match.group()
                        if new_url != self.current_url:
                            self.current_url = new_url
                            logger.info(f"Nuevo tunnel: {new_url}")
                            return new_url
                
                # If proc died unexpectedly
                if self.process.poll() is not None:
                    logger.error("Cloudflared terminó inesperadamente")
                    return None
            
            logger.error("Timeout esperando URL del tunnel")
            return None
            
        except Exception as e:
            logger.error(f"Error iniciando tunnel: {e}")
            return None
    
    def check_tunnel_health(self):
        """
        Checks if the tunnel is working
        """
        if not self.current_url:
            return False
        
        try:
            response = requests.get(self.current_url, timeout=10)
            return response.status_code == 200
        except requests.RequestException as e:
            logger.warning(f"Tunnel no responde: {e}")
            return False
    
    async def tunnel_monitor_loop(self):
        """
        Main monitoring loop
        """
        self.is_running = True
        
        # Start initial tunnel
        url = self.start_tunnel()
        if url:
            await self.send_telegram_message(
                f"----> Tunnel Iniciado <----\n"
                f"-> URL:  {url} \n"
                f"-> Monitoreo activado cada {CHECK_INTERVAL}s"
            )
        else:
            await self.send_telegram_message(
                "***ERROR***\nNo se pudo iniciar el tunnel inicial"
            )
            return
        
        consecutive_failures = 0
        
        while self.is_running:
            try:
                # Check health
                if self.check_tunnel_health():
                    consecutive_failures = 0
                    logger.info(f"Tunnel saludable: {self.current_url}")
                else:
                    consecutive_failures += 1
                    logger.warning(f"Tunnel caído. Fallos consecutivos: \
                                   {consecutive_failures}")
                    
                    if consecutive_failures >= FAILURE_LIMIT:
                        await self.send_telegram_message(
                            f"----> Reiniciando Tunnel <----\n"
                            f"-> Fallos consecutivos: {consecutive_failures}\n"
                            f"-> URL anterior: {self.current_url}"
                        )
                        
                        # Restart tunnel
                        new_url = self.start_tunnel()
                        if new_url:
                            await self.send_telegram_message(
                                f"----> Tunnel Recuperado <----\n"
                                f"-> Nueva URL: {new_url}"
                            )
                            consecutive_failures = 0
                        else:
                            await self.send_telegram_message(
                                "****Error Grave****\n"
                                "No se pudo recuperar el tunnel"
                            )
                
                # Wait before next check
                await asyncio.sleep(CHECK_INTERVAL)
                
            except Exception as e:
                logger.error(f"Error en loop de monitoreo: {e}")
                await asyncio.sleep(CHECK_INTERVAL)
    
    def stop(self):
        """
        Stops tunnel manager
        """
        self.is_running = False
        if self.process and self.process.poll() is None:
            self.process.terminate()
            self.process.wait()
        logger.info("Tunnel Manager detenido")

# Telegram Handlers
async def start_command(update, context):
    """
    START command (/start)
    """
    await update.message.reply_text(
        "----> Bot de Monitoreo de Tunnel <----\n\n"
        "-> Monitoreando iRock App tunel...\n"
        "-> Event notifications:\n"
        "--> Se inicie un nuevo tunnel\n"
        "--> El tunnel se caiga\n"
        "--> Se recupere automáticamente\n\n"
        "-> Comandos:\n"
        "/status - Estado actual\n"
        "/url - URL actual del tunnel\n"
        "/restart - Reiniciar tunnel",
        parse_mode='Markdown'
    )

async def status_command(update, context):
    """
    STATUS command (/status)
    """
    try:
        tunnel_manager = context.application.tunnel_manager
        
        if tunnel_manager.current_url:
            status = "UP" if tunnel_manager.check_tunnel_health() else "DOWN"
            await update.message.reply_text(
                f"----> Estado del Tunnel <----\n"
                f"-> Status: {status}\n"
                f"-> URL: {tunnel_manager.current_url}\n"
                f"-> Monitoreo: {'ACTIVO' if tunnel_manager.is_running else 'INACTIVO'}",
                parse_mode='Markdown'
            )
        else:
            await update.message.reply_text("*** NO HAY TUNNEL ACTIVO ***")
    except Exception as e:
        logger.error(f"Error en comando /status: {e}")
        try:
            await update.message.reply_text("Error al obtener estado")
        except:
            pass

async def url_command(update, context):
    """
    URL command (/url)
    """
    try:
        tunnel_manager = context.application.tunnel_manager
        
        if tunnel_manager.current_url:
            await update.message.reply_text(
                f"----> URL Actual <----\n{tunnel_manager.current_url}",
                parse_mode='Markdown'
            )
        else:
            await update.message.reply_text("*** NO HAY URL DISPONIBLE ***")
    except Exception as e:
        logger.error(f"Error en comando /url: {e}")
        try:
            await update.message.reply_text("Error al obtener URL")
        except:
            pass

async def restart_command(update, context):
    """
    RESTART command (/restart)
    """
    try:
        tunnel_manager = context.application.tunnel_manager
        
        await update.message.reply_text("-> Reiniciando tunnel...")
        
        new_url = tunnel_manager.start_tunnel()
        if new_url:
            await update.message.reply_text(
                f"----> Tunnel Reiniciado <----\nNueva URL: {new_url}",
                parse_mode='Markdown'
            )
        else:
            await update.message.reply_text("*** ERROR REINICIANDO TUNNEL ***")
    except Exception as e:
        logger.error(f"Error en comando /restart: {e}")
        try:
            await update.message.reply_text("Error al reiniciar")
        except:
            pass

async def error_handler(update, context):
    """
    Global error handler for bot errors
    """
    logger.error(f"Update {update} caused error: {context.error}")
    try:
        if update and update.message:
            await update.message.reply_text(
                "Ocurrió un error procesando tu comando. Intenta de nuevo."
            )
    except:
        pass

def main():
    """
    mAIN FNCTION
    """
    # Set app with custom timeout
    application = (
        Application.builder()
        .token(BOT_TOKEN)
        .connect_timeout(30.0)
        .read_timeout(30.0)
        .write_timeout(30.0)
        .build()
    )
    
    # Set tunnel mgr
    tunnel_manager = TunnelManager(BOT_TOKEN, CHAT_ID, LOCAL_URL)
    application.tunnel_manager = tunnel_manager
    
    # Add commands
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("status", status_command))
    application.add_handler(CommandHandler("url", url_command))
    application.add_handler(CommandHandler("restart", restart_command))
    
    # Add error handler
    application.add_error_handler(error_handler)
    
    logger.info("Iniciando Bot...")
    
    async def run_application():
        """
        Run application with monitoring loop.
        Both in same event loop. This is a fix to prevent conflicts and 
        unexpected exceptions.
        """
        # Bot init
        await application.initialize()
        await application.start()
        await application.updater.start_polling()
        
        # Start monitoring in parallel
        monitoring_task = asyncio.create_task(
            tunnel_manager.tunnel_monitor_loop())
        
        try:
            # Keep running until Ctrl+C
            await monitoring_task
        except asyncio.CancelledError:
            logger.info("Deteniendo aplicación...")
        finally:
            tunnel_manager.stop()
            await application.updater.stop()
            await application.stop()
            await application.shutdown()
    
    try:
        asyncio.run(run_application())
    except KeyboardInterrupt:
        logger.info("Detenido por usuario")
    except Exception as e:
        logger.error(f"Error crítico: {e}")
        tunnel_manager.stop()

if __name__ == "__main__":
    main()