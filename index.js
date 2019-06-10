//Importando a dependencia "Express"
const express = require ('express');
//Chamando a dependencia como uma função
const app = express();
//Importando a dependencia "Body parser"
const bodyParser = require ('body-parser');
//Importando a dependencia "SQLite"
const sqlite = require ('sqlite');
//Criando a conexão e o banco de dados
const dbConnection = sqlite.open('bd.sqlite', { Promise });
//Determina que a dependencia "EJS" será o template fron-end
app.set('view engine', 'ejs');
//Determina que a dependencia "Express" procure arquivos na pasta "public", caso não ache na pasta principal da aplicação
app.use(express.static('public'));
//Determina que toda requisição que passar pelo "Express" deve passar pelo "Body Parser"
app.use(bodyParser.urlencoded({extended: true}));
//Determinando uma mensagem de resposta quando a aplicação for acessada (requisição)
app.get('/', async(request, response) => {
    //console.log(new Date());
    //Resposta da requisição
    //response.send('<h1>Olá Fullstack lab!</h1>');
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;') //Seleciona todos os itens de "categorias"
    const vagas = await db.all('select * from vagas;') //Seleciona todos os itens de "categorias"
    //Pegar todos os itens da tabela categorias e filtra todas as vagas e suas respectivas categorias
    const categorias = categoriasDb.map (cat => {
        return {
            ...cat, //"..." siginifica espalhaar todos os itens de categoria dentro do objeto.
            vagas: vagas.filter (vaga => vaga.categoria === cat.id)
        }
    });
    //Renderiza outro arquivo de template EJS (html)
    response.render('home', {
        categorias
    })
});

//Renderiza o arquivo vaga.js (relativoa vizualização da vaga)
app.get('/vaga/:id', async (request, response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = '+request.params.id) //"GET" é usado quando queremos pegar somente 1 dado
    response.render('vaga', {
        vaga
    })
});

//Renderiza a área de administracao em /admin/home.ejs
app.get('/admin', async (req, res) => {
    res.render ('admin/home')
});

//Renderiza todas as vagas na área de administracao
app.get('/admin/vagas', async (req, res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas;')
    res.render('admin/vagas', {vagas})
});

//Renderiza todas as categorias na área de administracao
app.get('/admin/categorias', async (req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/categorias', { categorias })
    console.log(categorias)
});

//Cria um link para deletar as vagas e redireciona para área de admin após apagar a vaga
app.get('/admin/vagas/delete:id', async (req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id+'')
    res.redirect('admin/vagas')
});

//Cria página/link e a rendereização para uma nova vaga
app.get('/admin/vagas/nova', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render ('admin/nova-vaga', {categorias})
});

//Ativa o método post para as requisições da página /admin/vagas/nova
app.post('/admin/vagas/nova', async (req, res) => {
    const db = await dbConnection
    const { titulo, descricao, categoria } = req.body //Pega cada item do objeto "req.body"
    await db.run(`insert into vagas(categoria, titulo, descricao) values ('${categoria}', '${titulo}', '${descricao}')`)
    res.redirect ('/admin/vagas')
});

//Cria página/link e a rendereização para a edicao de uma vaga
app.get('/admin/vagas/editar/:id', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = '+req.params.id)
    res.render ('admin/editar-vaga', {categorias, vaga})
});

//Ativa o método post para as requisições da página /admin/vagas/editar-vaga
app.post('/admin/vagas/editar/:id', async (req, res) => {
    const db = await dbConnection
    const { titulo, descricao, categoria } = req.body //Pega cada item do objeto "req.body"
    const { id } = req.params
    await db.run(`update vagas set categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`)
    res.redirect ('/admin/vagas')
});

//Cria um método assíncrono para aguardar a conexão com o banco de dados e cria as tabelas
const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //const categoria = 'Marketing team'
    //É usado o sinal de crase ao invés de aspas para criar uma "template string" e podermos chamar uma variável dentro do comando SQL
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    //const vaga = 'Social Media (São Francisco)'
    //const descricao = 'Vaga para Fullstack developer que fez curso Fullstack Lab'
    //await db.run(`insert into vagas(categoria, titulo, descricao) values (2, '${vaga}', '${descricao}')`)
};
//Roda o método com o bd
init();

//Determinando a porta de entrada apara a aplicação, uma mensagem de erro e uma mensagem de acesso ok
//Quando a aplicação estiver rodando na web temos que usar a posta 80 (http) ou 443 (https)
//Em ambiente de desenvolvimento usamos uma porta alta Ex.: 3000 para evitar conflitos com outras aplicações (Ex.: antiviros)
app.listen (4000, (err) => {
    if(err) {
        console.log ('Não foi possível iniciar o servidor do Jobify.');
    }
    else {
        console.log ('Servidor do Jobify rodando ...');
        
    }
})

/*Javascript é uma linguagem Monothread, ou seja, ele executa os códigos sequencialmente, de acordo com 
repetições, desvios, funções e procedimentos, onde a utilização de concorrência é efetuada através da 
implementação de processos independentes e subprocessos, caso exista essa necessidade. */
//Para parar o servidor node/NPM devemos clicar "ctrl + c"
// A dependencia "EJS" é uma biblioteca de template que separa o html da programação lógica (javascript)
