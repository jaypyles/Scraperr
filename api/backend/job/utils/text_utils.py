def clean_text(text: str):
    text = text.strip()
    text = text.replace("\n", " ")
    text = text.replace("\t", " ")
    text = text.replace("\r", " ")
    text = text.replace("\f", " ")
    text = text.replace("\v", " ")
    text = text.replace("\b", " ")
    text = text.replace("\a", " ")
    return text
