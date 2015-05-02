package sqlutil;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * A static class that stores basic ResultConverters.
 *
 * @author narobins
 * @author yz38
 * @author ktsakas
 * @author fbystric
 */
public final class ResultConverters {
  private ResultConverters() {
  }

  /**
   * Constructs a ResultConverter object for ResultSets of just one column.
   *
   * @param type
   *          The type of object stored in the resultset.
   * @param <T>
   *          The type of object to be returned by this ResultConverter.
   * @return A ResultConverter that converts rows of resultsets to objects of
   *         type 'type'.
   */
  public static <T> ResultConverter<T> singleColumnConverter(Class<T> type) {
    return new ResultConverter<T>() {
      @Override
      public T convert(ResultSet rs) throws SQLException {
        return type.cast(rs.getObject(1));
      }
    };
  }
}
