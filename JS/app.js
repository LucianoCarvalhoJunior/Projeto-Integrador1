    
    //IMPORTAÇÕES de pacotes

    require('dotenv').config() //Pacote para pegar dados sensiveis da aplicação e salvar em nossa máquina.
    const express = require('express')
    const mongoose = require('mongoose')
    const bcrypt = require('bcrypt')
    const jwt = require ('jsonwebtoken')


    const app = express() //Executar o express em uma variavel
    //Configuração de resposta Json
    app.use(express.json())


    //Models
    const User = require('./User')
const { restart } = require('nodemon')

    //Rota de acesso publico
    app.get('/',(req,res) =>{
        res.status(200).json({msg: 'Bem vindo a nossa API!'})
    })

    //Rota privada
    app.get("/user/:id",checkToken,async(req,res)=>{

        const id = req.params.id
        //checagem de existencia de usuario
        const user = await User.findById(id,'-password')//Exclui a senha do usuario do retorno dado

        if(!user){
            return res.status(404).json({msg:'Usuário não encontrado!'})
        }

        res.status(200).json(user)

    })

    function checkToken(req,res,next){ //Verifica se o usuario possui o token de acesso
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(!token){
            return res.status(401).json({msg: 'Acesso negado!'})
        }


        try{

            const secret = process.env.SECRET
            jwt.verify(token,secret)

            next()


        }catch(error){
            res.status(400).json({msg:'Token inválido!'})
        }



    }













    
    //Registro de usuarios(Rota)
    app.post('/auth/register',async(req,res)=> {
        
        const {name,email,password,confirmpassword} = req.body

        //validações
        if(!name){
            return res.status(422).json({msg: 'O nome é obrigatório!'})
        }

        if(!email){
            return res.status(422).json({msg: 'O email é obrigatório!'})
        }

        if(!password){
            return res.status(422).json({msg: 'A senha é obrigatória!'})
        }

        if(password !== confirmpassword){
            return res.status(422).json({msg: 'As senhas não conferem!'})
        }

        //Verificação se o usuario já existe
        const userExists = await User.findOne({email: email})

        if(userExists){
            return res.status(422).json({msg: 'Por favor, utilize outro email!'})
        }

        //Criação de senha

        const salt = await bcrypt.genSalt(12)//Dificuldade da senha
        const passwordHash = await bcrypt.hash(password,salt) //Para ganrantir a segurança das senhas usa-se o metodo hash e o salt(dificuldade) a partir da senha digitada.

        //Criação de usuario

        const user = new User({ //Instanciando um novo objeto(Usuario)
            name,
            email,
            password: passwordHash,

        })

        try{//Verificação de criação de usuario

            await user.save()//Salva o usuario no banco de dados
            res.status(201).json({msg:'Usuário criado com sucesso'})

        }catch(error){
            console.log(error)
            res.status(500).json({msg:'Problemas no servidor, tente novamente mais tarde!'})
        }

        

    })
















    //Login de usuario
    app.post("/auth/login",async(req,res)=>{

        const {email,password}=req.body
        //validações

        if(!email){
            return res.status(422).json({msg: 'O email é obrigatório!'})
        }

        if(!password){
            return res.status(422).json({msg: 'A senha é obrigatória!'})
        }

        //Checar se o usuario existe
        const user = await User.findOne({email: email})

        if(!user){
            return res.status(422).json({msg: 'Usuário não encontrado!'}) //422 = não encontrado
        }

        //Checar se a senha combina com o usuario

        const checkPassword = await bcrypt.compare(password,user.password) //Compara usuario e senha

        if(!checkPassword){
            return res.status(422).json({msg: 'Senha inválida!'})
        }

        try{
            const secrect = process.env.SECRET

            const token = jwt.sign(
            {
                id: user._id,
            },
             secrect,
            )
            res.status(200).json({msg: 'Autenticação realizada com sucesso!',token})

        }catch(err){
            console.log(error)
            res.status(500).json({msg:'Problemas no servidor, tente novamente mais tarde!'}) 
        }


    })

















    //Credenciais
    const dbUser = process.env.DB_USER//Problema de segurança! Variaveis não recebem os parametros

    const dbPassword = process.env.DB_PASS//Problema de segurança! Variaveis não recebem os parametros


    mongoose
    .connect(
        `mongodb+srv://Gualter:semestre3@cluster0.amoxf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    ) //Conexão por aplicação no MongoDB ATLAS
    
    .then(() => {//Verificação de conexão

        app.listen(3000)//Disponibilizando o acesso ao API do meu PC na porta 3000
        console.log("Conectou ao banco!")


    }).catch((err) => console.log(err))
 


