from .place_types import SPOT_CATEGORIES


def get_spot_category(primary_type, types_list=None):
    if types_list is None:
        types_list = []

    all_types = [primary_type] + types_list if primary_type else types_list

    for spot_type in all_types:
        for cat_key, cat_data in SPOT_CATEGORIES.items():
            if spot_type in cat_data['types']:
                return cat_key

    return None
