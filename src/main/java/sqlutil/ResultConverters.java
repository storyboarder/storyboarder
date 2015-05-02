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
   * @param column
   *          The column of the ResultSet that stores the desired object.
   *          Columns are 1-indexed.
   * @param type
   *          The type of object stored in the ResultSet.
   * @param <T>
   *          The type of object to be returned by this ResultConverter.
   * @return A ResultConverter that converts rows of ResultSets to objects of
   *         type 'type'.
   */
  public static <T> ResultConverter<T> singleColumnConverter(int column,
      Class<T> type) {
    return new ResultConverter<T>() {
      @Override
      public T convert(ResultSet rs) throws SQLException {
        return type.cast(rs.getObject(column));
      }
    };
  }
}
