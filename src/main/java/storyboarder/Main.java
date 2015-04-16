package storyboarder;

import java.net.UnknownHostException;

/**
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
public final class Main {

  private Main() {
  }

  public static void main(String[] args) throws UnknownHostException {
    Multiplayer server = new Multiplayer(8887);
    server.start();
    
    Gui.runSparkServer(8000);
  }

}
