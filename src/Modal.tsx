const data = [
  {
    name: "A <numer rejestru 1>,<adres pamięci>",
    description:
      "dodanie do zawartości pierwszego rejestru zawartości czterobajtowego słowa zapisanego w pamięci pod podanym adresem",
  },
  {
    name: "AR <numer rejestru 1>,<numer rejestru 2>",
    description:
      "dodanie do zawartości pierwszego rejestru zawartości drugiego rejestru",
  },
  {
    name: "S <numer rejestru 1>,<adres pamięci>",
    description:
      "odjęcie od zawartości pierwszego rejestru zawartości czterobajtowego słowa zapisanego w pamięci pod podanym adresem",
  },
  {
    name: "SR <numer rejestru 1>,<numer rejestru 2>",
    description:
      "odjęcie od zawartości pierwszego rejestru zawartości drugiego rejestru",
  },
  {
    name: "M <numer rejestru 1>,<adres pamięci>",
    description:
      "pomnożenie zawartości pierwszego rejestru przez zawartość czterobajtowego słowa zapisanego w pamięci pod podanym adresem",
  },
  {
    name: "MR <numer rejestru 1>,<numer rejestru 2>",
    description:
      "pomnożenie zawartości pierwszego rejestru przez zawartość drugiego rejestru",
  },
  {
    name: "D <numer rejestru 1>,<adres pamięci>",
    description:
      "podzielenie zawartości pierwszego rejestru przez zawartość czterobajtowego słowa zapisanego w pamięci pod podanym adresem",
  },
  {
    name: "DR <numer rejestru 1>,<numer rejestru 2>",
    description:
      "podzielenie zawartości pierwszego rejestru przez zawartość drugiego rejestru",
  },
  {
    name: "C <numer rejestru 1>,<adres pamięci>",
    description:
      "zapisanie informacji o znaku wyniku identycznej do informacji otrzymanej z analogicznego rozkazu odejmowania",
  },
  {
    name: "CR <numer rejestru 1>,<numer rejestru 2>",
    description:
      "zapisanie informacji o znaku wyniku identycznej do informacji otrzymanej z analogicznego rozkazu odejmowania",
  },
  {
    name: "L <numer rejestru 1>,<adres pamięci>",
    description:
      "zapisanie zawartości czterobajtowego słowa pamięci (drugi argument) w rejestrze o numerze podanym jako pierwszy argument",
  },
  {
    name: "LR <numer rejestru 1>,<numer rejestru 2>",
    description:
      "zapisanie zawartości drugiego rejestru do pierwszego rejestru",
  },
  {
    name: "ST <numer rejestru 1>,<adres pamięci>",
    description:
      "zapisanie zawartości rejestru do czterobajtowego słowa pamięci",
  },
  {
    name: "LA <numer rejestru 1>,<adres pamięci>",
    description:
      "zapisanie adresu słowa pamięci o adresie podanym w rozkazie do rejestru o numerze podanym w rozkazie",
  },
  {
    name: "J <adres pamięci>",
    description:
      "wykonanie rozkazu zapisanego w pamięci pod adresem podanym w rozkazie",
  },
  {
    name: "JP <adres pamięci>",
    description:
      "wykonanie rozkazu zapisanego w pamięci pod podanym adresem jeśli wynik ostatnio wykonanego rozkazu arytmetycznego lub rozkazu porównania był dodatni",
  },
  {
    name: "JZ <adres pamięci>",
    description:
      "wykonanie rozkazu zapisanego w pamięci pod podanym adresem jeśli wynik ostatnio wykonanego rozkazu arytmetycznego lub rozkazu porównania był równy zero",
  },
  {
    name: "JN <adres pamięci>",
    description:
      "wykonanie rozkazu zapisanego w pamięci pod podanym adresem jeśli wynik ostatnio wykonanego rozkazu arytmetycznego lub rozkazu porównania był ujemny",
  },
  {
    name: "DC <liczba komórek>*INTEGER(<liczba całkowita>)",
    description:
      "rezerwacja czterobajtowych komórek pamięci i wypełnienie każdej podaną wartością",
  },
  {
    name: "DS <liczba komórek>*INTEGER",
    description: "rezerwacja czterobajtowych komórek pamięci",
  },
];

export function Modal({
  active,
  close,
}: {
  active: boolean;
  close: () => void;
}) {
  return (
    <div className={`modal ${active ? "is-active" : ""}`}>
      <div className="modal-background" onClick={close}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Rozkazy pseudoasemblera</p>
        </header>
        <section className="modal-card-body">
          <table className="table is-striped is-hoverable is-fullwidth">
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <footer className="modal-card-foot">
          <button className="button" onClick={close}>
            Zamknij
          </button>
        </footer>
      </div>
    </div>
  );
}
