from django.core.mail import send_mail
from django_tasks import task
from .models import Reservation



@task(priority=100)
def send_reservation_mail_task(reservation_id: int):
    try:
        instance = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return
        
    subject = f"Potwierdzenie rezerwacji w {instance.spot.name}"
    message = (
        f"Dziękujemy za rezerwację w {instance.spot.name}.\n"
        f"Twoja rezerwacja na {instance.reservation_time} została wysłana do potwierdzenia.\n"
        f"Liczba gości {instance.guests}\n"
        f"Pozdrawiamy,\nZespół SpotFinder"
    )
    recipient_list = [instance.user.email]
    send_mail(subject, message, None, recipient_list)