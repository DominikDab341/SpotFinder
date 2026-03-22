from django.core.mail import send_mail
from django_tasks import task
from .models import Reservation



@task()
def send_reservation_mail_task(reservation_id: int):
    try:
        instance = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return
        
    subject = f"Reservation confirmation at {instance.spot.display_name}"
    message = (
        f"Thank you for your reservation at {instance.spot.display_name}.\n"
        f"Your reservation for {instance.reservation_time} has been sent for confirmation.\n"
        f"Number of guests: {instance.guests}\n"
        f"Best regards,\nSpotFinder Team"
    )
    recipient_list = [instance.user.email]
    send_mail(subject, message, None, recipient_list)