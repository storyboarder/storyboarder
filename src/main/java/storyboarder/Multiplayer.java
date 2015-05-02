package storyboarder;

import java.net.InetSocketAddress;
import java.util.Collection;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

/**
 * A simple WebSocketServer implementation. Keeps track of a "chatroom".
 *
 * @author ktsakas
 * @author fbystric
 * @author narobins
 * @author yz38 *
 */
class Multiplayer extends WebSocketServer {

  /**
   * Constructs a Multiplayer server at the given port.
   *
   * @param port
   *          The port at which to host the multiplayer server.
   */
  Multiplayer(int port) {
    super(new InetSocketAddress(port));
    System.out.println("Listening for multiplayer requests on port " + port
        + "...");
  }

  /**
   * Constructs a Multiplayer server with the given socket address.
   *
   * @param address
   *          The socket address at which to start the server.
   */
  Multiplayer(InetSocketAddress address) {
    super(address);
  }

  /**
   * Prints an alert when someone opens the site.
   *
   * @param conn
   *          The WebSocket connecting users.
   * @param handshake
   *          When two clients meet and introduce themselves to one another.
   */
  @Override
  public void onOpen(WebSocket conn, ClientHandshake handshake) {
    System.out.println(conn.getRemoteSocketAddress().getAddress()
        .getHostAddress() + " entered the room!");
  }

  /**
   * Prints an alert when someone leaves the site.
   *
   * @param conn
   *          The WebSocket connecting users.
   * @param code
   *          The code of the user leaving.
   * @param reason
   *          The reason the user is leaving.
   * @param remote
   *          Whether the user is local or remote.
   */
  @Override
  public void onClose(WebSocket conn, int code, String reason, boolean remote) {
    System.out.println(conn + " has left the room!");
  }

  /**
   * Upon receiving a message from the WebSocket, sends it to the other users.
   *
   * @param conn
   *          The WebSocket connecting users.
   * @param message
   *          The message received.
   */
  @Override
  public void onMessage(WebSocket conn, String message) {
    sendToOthers(conn, message);
    System.out.println(conn + ": " + message);
  }

  /**
   * If an exception occurs, prints a stack trace for debugging purposes.
   *
   * @param conn
   *          The WebSocket connecting users.
   * @param ex
   *          The exception thrown.
   */
  @Override
  public void onError(WebSocket conn, Exception ex) {
    ex.printStackTrace();
  }

  /**
   * Sends 'text' to all currently connected WebSocket clients.
   *
   * @param conn
   *          The WebSocket connecting users.
   * @param text
   *          The String to send across the network.
   */
  public void sendToOthers(WebSocket conn, String text) {
    Collection<WebSocket> con = connections();
    synchronized (con) {
      for (WebSocket c : con) {
        if (!conn.equals(c)) {
          c.send(text);
        } else {
          System.out.println("Do not send to self!");
        }
      }
    }
  }
}
