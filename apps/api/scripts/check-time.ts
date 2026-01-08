const https = require("https");

console.log("Verificando relógio do sistema...");
const localTime = new Date();
console.log(`Hora Local: ${localTime.toISOString()}`);

console.log("Verificando hora do servidor Google...");

const req = https.request(
  "https://google.com",
  { method: "HEAD" },
  (res: any) => {
    const serverDate = res.headers.date;
    if (serverDate) {
      const googleTime = new Date(serverDate);
      console.log(`Hora Google: ${googleTime.toISOString()}`);

      const diff = Math.abs(localTime.getTime() - googleTime.getTime());
      const diffMinutes = Math.floor(diff / 1000 / 60);

      console.log(`\n Diferença: ${diffMinutes} minutos`);

      if (diffMinutes > 5) {
        console.error(
          "PERIGO: Seu relógio está muito dessincronizado! Isso invalida o JWT do Google."
        );
        console.error(
          "Solução: Ajuste a data/hora do seu computador para o horário automático/correto."
        );
      } else {
        console.log("Hora sincronizada. O problema não é o relógio.");
      }
    } else {
      console.log("Não foi possível obter a hora do Google.");
    }
  }
);

req.on("error", (e: any) => {
  console.error(`❌ Erro de conexão: ${e.message}`);
});

req.end();
