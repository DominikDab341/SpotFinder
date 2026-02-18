from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import Reservation

#TODO: Use Django Tasks
@receiver(post_save, sender=Reservation)
def send_reservation_mail(sender, instance, created, **kwargs):
    if created:
        subject = f"Potwierdzenie rezerwacji w {instance.spot.name}"
        message = (
            f"Dziękujemy za rezerwację w {instance.spot.name}.\n"
            f"Twoja rezerwacja na {instance.reservation_date} została wysłana do potwierdzenia.\n"
            f"Liczba gości {instance.guests}\n"
            f"Pozdrawiamy,\nZespół SpotFinder"
        )
        recipient_list = [instance.user.email]
        send_mail(subject, message, None, recipient_list)
