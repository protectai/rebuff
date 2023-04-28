class Rebuff:
    def __init__(self, api_token, api_url):
        self.api_token = api_token

    def is_injection_detected(self, user_input):
        # Implement the logic to detect prompt injection.
        pass

    def add_canaryword(self, prompt_template):
        # Implement the logic to add canary word to the prompt.
        pass

    def is_canaryword_leaked(self, completion, canary_word):
        # Implement the logic to detect canary word leakage.
        pass
