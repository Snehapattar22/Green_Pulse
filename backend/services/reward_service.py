def calculate_reward(co2):

    if co2 < 20:
        return 0.005
    elif co2 < 30:
        return 0.002
    elif co2 < 40:
        return 0.001
    else:
        return 0
