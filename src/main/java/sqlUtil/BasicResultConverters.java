package sqlUtil;

import java.sql.ResultSet;
import java.sql.SQLException;

public final class BasicResultConverters {
  public static final ResultConverter<Integer> INT_CONVERTER = new IntConverter();
  public static final ResultConverter<String> STRING_CONVERTER = new StringConverter();
  public static final ResultConverter<Double> DOUBLE_CONVERTER = new DoubleConverter();

  private static class IntConverter implements ResultConverter<Integer> {
    @Override
    public Integer convert(ResultSet rs) throws SQLException {
      return rs.getInt(1);
    }
  }

  private static class StringConverter implements ResultConverter<String> {
    @Override
    public String convert(ResultSet rs) throws SQLException {
      return rs.getString(1);
    }
  }

  private static class DoubleConverter implements ResultConverter<Double> {
    @Override
    public Double convert(ResultSet rs) throws SQLException {
      return rs.getDouble(1);
    }
  }

}
