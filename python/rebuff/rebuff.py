import requests


class Rebuff:
    def __init__(self, api_token, api_url):
        self.api_token = api_token
        self.api_url = api_url

    def is_injection_detected(self, user_input):
        headers = {"Authorization": f"Bearer {self.api_token}"}
        data = {"action": "detectInjection", "inputText": user_input}
        response = requests.post(self.api_url, json=data, headers=headers)
        response.raise_for_status()
        return response.json()

    def detect_leakage(self, output_text, canary_word):
        headers = {"Authorization": f"Bearer {self.api_token}"}
        data = {"action": "detectLeakage", "outputText": output_text, "canaryWord": canary_word}
        response = requests.post(self.api_url, json=data, headers=headers)
        response.raise_for_status()
        return response.json()

    def add_canaryword(self, prompt_template, key=None, canary_word=None):
        # Implement the logic to add canary word to the prompt.
        pass

    def is_canaryword_leaked(self, completion, canary_word):
        # Implement the logic to detect canary word leakage.
        pass
