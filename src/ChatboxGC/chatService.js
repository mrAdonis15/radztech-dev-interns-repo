/**
 * BroadcastChannel-based group chat service.
 * Simulates backend-ready messaging across browser tabs.
 * Can be swapped for WebSocket without changing UI.
 */

const CHANNEL_NAME = "chatbox-gc-channel";

function createChatService(roomId) {
  let channel = null;
  let messageHandler = null;
  let onMessage = null;

  function isSupported() {
    return typeof BroadcastChannel !== "undefined";
  }

  function connect(callback) {
    if (!isSupported()) {
      return;
    }
    if (channel) {
      disconnect();
    }
    channel = new BroadcastChannel(CHANNEL_NAME);
    onMessage = callback;
    messageHandler = function (event) {
      try {
        const data = event.data;
        if (data && data.type === "chat-message" && data.roomId === roomId) {
          callback(data.payload);
        }
      } catch (err) {
        console.error("[chatService] message handler error:", err);
      }
    };
    channel.addEventListener("message", messageHandler);
  }

  /**
   * Sends a message to the room. Other tabs receive it via BroadcastChannel.
   * Also notifies this tab via onMessage and returns the created message so the
   * sender can show it in the UI even if connect/onMessage timing is off.
   * @returns {{ id, roomId, userId, username, message, createdAt } | null} the created message, or null if send failed
   */
  function sendMessage(payload) {
    if (!payload || typeof payload.message !== "string") {
      return null;
    }
    const msg = {
      id: generateId(),
      roomId: payload.roomId,
      userId: payload.userId,
      username: payload.username || "User",
      message: payload.message.trim(),
      createdAt: new Date().toISOString(),
    };
    if (channel && isSupported()) {
      channel.postMessage({
        type: "chat-message",
        roomId: roomId,
        payload: msg,
      });
      if (onMessage) onMessage(msg);
    }
    return msg;
  }

  function disconnect() {
    if (channel && messageHandler) {
      channel.removeEventListener("message", messageHandler);
      channel.close();
      channel = null;
      messageHandler = null;
      onMessage = null;
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  return {
    connect: connect,
    sendMessage: sendMessage,
    disconnect: disconnect,
    isSupported: isSupported,
  };
}

export { createChatService };
