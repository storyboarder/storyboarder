package sqlutil;

import java.sql.ResultSet;
import java.sql.SQLException;

public interface ResultConverter<T> {
  T convert(ResultSet rs) throws SQLException;

  public static <E> ResultConverter<E> singleColumnConverter(Class<E> type) {
    return new ResultConverter<E>() {
      @Override
      public E convert(ResultSet rs) throws SQLException {
        return type.cast(rs.getObject(1));
      }
    };
  }
}
