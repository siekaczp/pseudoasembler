import type { DisplayProps } from "./types";

export default function Display({ firstColumn, data, format }: DisplayProps) {
  const formatValue = (value: number): string => {
    switch (format) {
      case "bin": {
        const matched = (value >>> 0)
          .toString(2)
          .padStart(32, "0")
          .match(/.{1,4}/g);

        return matched ? matched.join(" ") : "";
      }
      case "hex": {
        const matched = (value >>> 0)
          .toString(16)
          .toUpperCase()
          .padStart(8, "0")
          .match(/.{1,2}/g);

        return matched ? matched.join(" ") : "";
      }
      case "dec":
      default:
        return value.toString(10);
    }
  };

  return (
    <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th className="has-text-left">{firstColumn}</th>
          <th className="has-text-left">Wartość</th>
        </tr>
      </thead>
      <tbody className={format !== "dec" ? "is-family-monospace" : ""}>
        {data.map(([k, v], id) => (
          <tr key={id}>
            <td className="has-text-left">{k}</td>
            <td className="has-text-left">{formatValue(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
