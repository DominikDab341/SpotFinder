from django.apps import AppConfig


class SpotsConfig(AppConfig):
    name = 'spots'

    def ready(self):
        import spots.signals
