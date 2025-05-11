import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
from typing import Any

from api.backend.worker.logger import LOG

from api.backend.worker.post_job_complete.models import (
    JOB_COLOR_MAP,
    PostJobCompleteOptions,
)


def send_job_complete_email(
    job: dict[str, Any],
    options: PostJobCompleteOptions,
):
    status = job["status"]
    status_color = JOB_COLOR_MAP.get(status, 0x808080)
    job_url = job["url"]
    job_id = job["id"]
    job_options_json = json.dumps(job["job_options"], indent=4)
    frontend_url = options["scraperr_frontend_url"]

    subject = "📦 Job Completed - Scraperr Notification"

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #{status_color:06x};">✅ Job Completed</h2>
        <p>Scraping job has been completed successfully.</p>

        <a href="{frontend_url}/jobs?search={job_id}&type=id" target="_blank">
          <img src="https://github.com/jaypyles/Scraperr/raw/master/docs/logo_picture.png" alt="Scraperr Logo" width="200">
        </a>

        <h3>Job Info:</h3>
        <ul>
          <li><strong>Status:</strong> {status}</li>
          <li><strong>Job URL:</strong> <a href="{job_url}">{job_url}</a></li>
          <li><strong>Job ID:</strong> {job_id}</li>
        </ul>

        <h3>Options:</h3>
        <pre style="background-color:#f4f4f4; padding:10px; border-radius:5px;">
{job_options_json}
        </pre>

        <h3>View your job here:</h3>
        <a href="{options['scraperr_frontend_url']}/jobs?search={job_id}&type=id">Scraperr Job</a>

        <p style="font-size: 12px; color: gray;">
          Sent by <a href="https://github.com/jaypyles/Scraperr" target="_blank">Scraperr</a>
        </p>
      </body>
    </html>
    """

    # Create email
    message = MIMEMultipart("alternative")
    message["From"] = options["email"]
    message["To"] = options["to"]
    message["Subject"] = subject
    message.attach(
        MIMEText(
            "Job completed. View this email in HTML format for full details.", "plain"
        )
    )
    message.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()

    try:
        if options["use_tls"]:
            with smtplib.SMTP(options["smtp_host"], options["smtp_port"]) as server:
                server.starttls(context=context)
                server.login(options["smtp_user"], options["smtp_password"])
                server.sendmail(
                    from_addr=options["email"],
                    to_addrs=options["to"],
                    msg=message.as_string(),
                )
        else:
            with smtplib.SMTP_SSL(
                options["smtp_host"], options["smtp_port"], context=context
            ) as server:
                server.login(options["smtp_user"], options["smtp_password"])
                server.sendmail(
                    from_addr=options["email"],
                    to_addrs=options["to"],
                    msg=message.as_string(),
                )
        LOG.info("✅ Email sent successfully!")
    except Exception as e:
        LOG.error(f"❌ Failed to send email: {e}")
