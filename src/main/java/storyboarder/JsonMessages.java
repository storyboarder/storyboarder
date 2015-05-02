package storyboarder;

import com.google.gson.Gson;

final class JsonMessages {

  private static final Gson GSON = new Gson();

  static Object makeMessage(String message) {
    return GSON.toJson(new Message(message));
  }

  static Object makeError(String error) {
    return GSON.toJson(new Error(error));
  }

  private static class Message {
    private final String message;

    private Message(String message) {
      this.message = message;
    }
  }

  private static class Error {
    private final String error;

    private Error(String error) {
      this.error = error;
    }
  }

}
