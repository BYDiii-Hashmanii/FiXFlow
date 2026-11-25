import ollama

print("Chat started. Type 'exit' to quit.\n")

while True:
    user_input = input("You: ").strip()

    if user_input.lower() in ("exit", "quit"):
        print("Goodbye!")
        break

    if not user_input:
        continue
    print("Bot: ", end="", flush=True) 

    # flush=True forces Python to print the text to the screen immediately, instead of holding it in a buffer.
    
    for chunk in ollama.chat(
    model="fixflow",
    messages=[{"role": "user", "content": user_input}],
    options={"num_predict": 150, "num_ctx": 1024, "num_thread": 4},
    keep_alive="30m",   # keep model loaded in memory
    stream=True,
    ):
        print(chunk["message"]["content"], end="", flush=True)
    print("\n")