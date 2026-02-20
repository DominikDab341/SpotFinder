from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reservation
from .tasks import send_reservation_mail_task


@receiver(post_save, sender=Reservation)
def send_reservation_mail(sender, instance, created, **kwargs):
    if created:
        send_reservation_mail_task.enqueue(instance.id)