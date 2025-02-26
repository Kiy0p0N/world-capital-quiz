import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

// Configuração do banco de dados PostgreSQL
const db = new pg.Client({
  user: "postgres",  // Usuário do banco de dados
  host: "localhost", // Host onde o banco está rodando
  database: "world", // Nome do banco de dados
  password: "hades", // Senha do banco de dados (evite expor senhas em código)
  port: 5432,        // Porta padrão do PostgreSQL
});

const app = express();
const port = 3000;  // Definição da porta onde o servidor será executado

let quiz = [];  // Array que armazenará as perguntas do quiz

db.connect(); // Conexão com o banco de dados

// Consulta ao banco para obter todas as capitais
db.query('SELECT * FROM capitals', (err, res)=>{
  if(err){
    console.error("Error executing query", err.stack);
  } else{
    quiz = res.rows; // Armazena os resultados da consulta no array quiz
  }

  db.end(); // Fecha a conexão com o banco de dados
});

let totalCorrect = 0; // Variável para armazenar a pontuação do usuário

// Middleware para processar dados do corpo da requisição
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Servir arquivos estáticos da pasta 'public'

let currentQuestion = {}; // Objeto que armazenará a pergunta atual do quiz

// Rota GET para a página inicial
app.get("/", async (req, res)=>{
  totalCorrect = 0;  // Reinicia a pontuação ao acessar a página inicial
  await nextQuestion(); // Seleciona uma nova pergunta
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion }); // Renderiza a página com a pergunta
});

// Rota POST para submissão da resposta do usuário
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim(); // Obtém e remove espaços da resposta do usuário
  let isCorrect = false;

  // Verifica se a resposta está correta (ignora maiúsculas/minúsculas)
  if(currentQuestion.capital.toLowerCase() === answer.toLowerCase()){
    totalCorrect++;  // Incrementa a pontuação se a resposta estiver correta
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion(); // Seleciona a próxima pergunta
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect, // Envia se a resposta anterior estava correta
    totalScore: totalCorrect, // Envia a pontuação total do usuário
  });
});

// Função para escolher uma nova pergunta aleatória do quiz
async function nextQuestion(){
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry; // Define a nova pergunta
}

// Inicia o servidor na porta definida
app.listen(port, ()=>{
  console.log(`Server is running at http://localhost:${port}`);
});
