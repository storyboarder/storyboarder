package storyboarder;

import com.google.gson.Gson;

/**
 * Utility class for creating JSON objects that represent messages or errors.
 *
 * @author fbystric
 * @author ktsakas
 * @author narobins
 * @author yz38
 */
final class JsonMessages {

  private static final Gson GSON = new Gson();

  private JsonMessages() {
    String message = "This class cannot have instances.";
    throw new UnsupportedOperationException(message);
  }

  /**
   * Creates a JSON message object with the given string.
   *
   * @param message
   *          The message to be passed in the message object.
   * @return a JSON message object containing the given message.
   */
  static Object makeMessage(String message) {
    return GSON.toJson(new Message(message));
  }

  /**
   * Creates a JSON error object with the given string.
   *
   * @param error
   *          The error to be passed in the error object.
   * @return a JSON error object containing the given error.
   */
  static Object makeError(String error) {
    return GSON.toJson(new Error(error));
  }

  /**
   * A Message class containing a field of the name 'message'.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   */
  private static final class Message {
    @SuppressWarnings("unused")
    private final String message;

    private Message(String message) {
      this.message = message;
    }
  }

  /**
   * An Error class containing a field of the name 'error'.
   *
   * @author fbystric
   * @author ktsakas
   * @author narobins
   * @author yz38
   */
  private static final class Error {
    @SuppressWarnings("unused")
    private final String error;

    private Error(String error) {
      this.error = error;
    }
  }

}
