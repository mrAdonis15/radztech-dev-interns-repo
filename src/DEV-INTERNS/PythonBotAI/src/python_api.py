#!/usr/bin/env python3
"""
Simple API wrapper for the AI chatbot.
Can be called from Node.js or used standalone.
"""

import sys
import json
import os
from io import StringIO
from contextlib import redirect_stdout

# Suppress stdout during imports
old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    try:
        from .main import respond, store_conversation
    except ImportError:
        from main import respond, store_conversation
finally:
    sys.stdout = old_stdout

def main():
    def is_access_sensitive_message(user_message):
        normalized = str(user_message or "").lower()
        return any(
            term in normalized
            for term in [
                "general ledger",
                "gl balance",
                "balance",
                "stock card",
                "inventory",
                "current biz",
                "selected biz",
                "live data",
                "access",
            ]
        )

    def generate_response(user_message, auth_context=None, conversation_style="normal", conversation_history=None):
        # Get response from the chatbot
        try:
            response = respond(user_message, auth_context=auth_context, conversation_style=conversation_style, conversation_history_input=conversation_history)
        except Exception as e:
            print(f"[ERROR] respond() raised exception: {type(e).__name__}: {str(e)}", file=sys.stderr, flush=True)
            response = None

        if response:
            result = response
        elif is_access_sensitive_message(user_message):
            result = (
                "I can't access the live business data right now. "
                "Please reconnect the logged-in business account and try again."
            )
        else:
            print(f"[DEBUG] respond() returned None/falsy for message: {user_message[:50]}...", file=sys.stderr, flush=True)
            result = "Sorry, Something went wrong. Please try again"

        # Store conversation context (optional - may not exist in main.py)
        try:
            store_conversation(user_message, result)
        except (NameError, AttributeError):
            pass

        return result

    if "--daemon" in sys.argv:
        # Line-delimited JSON protocol over stdin/stdout for a persistent worker.
        for line in sys.stdin:
            raw = line.strip()
            if not raw:
                continue

            try:
                payload = json.loads(raw)
            except Exception:
                print(json.dumps({"success": False, "error": "Invalid JSON payload"}), flush=True)
                continue

            message = str(payload.get("message", "")).strip()
            auth_context = payload.get("auth_context")
            conversation_style = payload.get("conversation_style", "normal")
            conversation_history = payload.get("conversation_history")
            if not message:
                print(json.dumps({"success": False, "error": "Message is required"}), flush=True)
                continue

            try:
                with redirect_stdout(sys.stderr):
                    result = generate_response(message, auth_context=auth_context, conversation_style=conversation_style, conversation_history=conversation_history)
                print(json.dumps({"success": True, "response": result}), flush=True)
            except Exception as e:
                print(json.dumps({"success": False, "error": str(e)}), flush=True)
        return

    if len(sys.argv) > 1:
        # Called with message argument from Node.js
        user_message = ' '.join(sys.argv[1:])
        output_json = True
    else:
        # Interactive mode
        user_message = input("You: ")
        output_json = False
    
    result = generate_response(user_message)
    
    if output_json:
        # Output as JSON for Node.js parsing
        print(json.dumps({"success": True, "response": result}))
    else:
        # Interactive mode output
        print(result)

if __name__ == "__main__":
    main()
