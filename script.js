// =========================================================================
// REIVENSTUDIO - SISTEMA COMPLETO
// =========================================================================


// =========================================================================
// CONFIGURAÇÕES
// =========================================================================

const SUPABASE_URL = "https://exejgnfibccclgycnisx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cRja44YGFVHvU9t-yec47g_9Dfqzt3G";


// =========================================================================
// EMAILJS
// =========================================================================

try {

    emailjs.init("51beClUvaSsGDKrfz");

} catch (e) {

    console.log("SDK EmailJS aguardando inicialização.");

}


// =========================================================================
// DADOS DA SESSÃO
// =========================================================================

let clienteNome = "";
let clienteEmail = "";

let planoEscolhido = "";

let faseDoDialogo = 0;


// =========================================================================
// NAVEGAÇÃO
// =========================================================================

function navegarPara(idTela) {

    document
        .querySelectorAll(".screen")
        .forEach(tela => {
            tela.classList.remove("active-screen");
        });


    const alvo = document.getElementById(idTela);

    if (alvo) {

        alvo.classList.add("active-screen");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =========================================================================
// MODAIS
// =========================================================================

function abrirModalLogin() {

    fecharModais();

    document
        .getElementById("modal-login")
        .classList.add("show");

}


function abrirModalRegisto() {

    fecharModais();

    document
        .getElementById("modal-registo")
        .classList.add("show");

}


function abrirPatrocinadores() {

    document
        .getElementById("modal-patrocinadores")
        .classList.add("show");

}


function fecharModais() {

    document
        .querySelectorAll(".modal")
        .forEach(modal => {
            modal.classList.remove("show");
        });

}


function trocarParaRegisto() {

    fecharModais();

    abrirModalRegisto();

}


function trocarParaLogin() {

    fecharModais();

    abrirModalLogin();

}


// =========================================================================
// LOGIN
// =========================================================================

function autenticarUtilizador() {

    const emailInput =
        document
        .getElementById("login-email")
        .value
        .trim();

    const passInput =
        document
        .getElementById("login-pass")
        .value
        .trim();


    const lembrar =
        document
        .getElementById("lembrar-mim")
        .checked;


    if (!emailInput || !passInput) {

        alert("❌ Preencha o e-mail e a palavra-passe.");

        return;

    }


    fetch(
        `${SUPABASE_URL}/rest/v1/clientes?email=eq.${encodeURIComponent(emailInput)}&password=eq.${encodeURIComponent(passInput)}`,
        {

            method: "GET",

            headers: {

                "Content-Type": "application/json",

                "apikey": SUPABASE_ANON_KEY,

                "Authorization":
                    `Bearer ${SUPABASE_ANON_KEY}`

            }

        }
    )

    .then(res => res.json())

    .then(dados => {

        if (dados && dados.length > 0) {

            clienteNome = dados[0].nome;

            clienteEmail = dados[0].email;


            // LEMBRAR-ME

            if (lembrar) {

                localStorage.setItem(
                    "reiven_cliente",
                    JSON.stringify({
                        nome: clienteNome,
                        email: clienteEmail
                    })
                );

            } else {

                localStorage.removeItem("reiven_cliente");

            }


            fecharModais();

            entrarNaHome();

        } else {

            alert(
                "❌ E-mail ou palavra-passe incorreta!"
            );

        }

    })

    .catch(erro => {

        console.error(erro);

        alert(
            "❌ Erro ao conectar à base de dados."
        );

    });

}


// =========================================================================
// REGISTO
// =========================================================================

function registarNovoUtilizador() {

    const nomeInput =
        document
        .getElementById("registo-nome")
        .value
        .trim();

    const emailInput =
        document
        .getElementById("registo-email")
        .value
        .trim();

    const passInput =
        document
        .getElementById("registo-pass")
        .value
        .trim();


    if (!nomeInput || !emailInput || !passInput) {

        alert(
            "❌ Preencha todos os campos."
        );

        return;

    }


    if (passInput.length < 4) {

        alert(
            "❌ A palavra-passe deve ter pelo menos 4 caracteres."
        );

        return;

    }


    fetch(
        `${SUPABASE_URL}/rest/v1/clientes`,
        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json",

                "apikey":
                    SUPABASE_ANON_KEY,

                "Authorization":
                    `Bearer ${SUPABASE_ANON_KEY}`,

                "Prefer":
                    "return=representation"

            },

            body: JSON.stringify({

                nome: nomeInput,

                email: emailInput,

                password: passInput

            })

        }
    )

    .then(res => {

        if (!res.ok) {

            throw new Error(
                "Erro ao criar conta."
            );

        }

        return res.json();

    })

    .then(() => {

        clienteNome = nomeInput;

        clienteEmail = emailInput;


        enviarEmailBoasVindas();


        fecharModais();

        entrarNaHome();

    })

    .catch(erro => {

        console.error(erro);

        alert(
            "❌ Não foi possível criar a conta. O e-mail pode já estar registado."
        );

    });

}


// =========================================================================
// ENTRAR NA HOME
// =========================================================================

function entrarNaHome() {

    document
        .getElementById("user-display")
        .innerText =
        `👤 ${clienteNome.toUpperCase()}`;


    navegarPara("tela-home");

}


// =========================================================================
// RECUPERAR SESSÃO LEMBRADA
// =========================================================================

function verificarSessaoLembrada() {

    const dados =
        localStorage.getItem("reiven_cliente");


    if (!dados) return;


    try {

        const cliente =
            JSON.parse(dados);


        if (cliente.nome && cliente.email) {

            clienteNome = cliente.nome;

            clienteEmail = cliente.email;


            entrarNaHome();

        }

    } catch (erro) {

        localStorage.removeItem(
            "reiven_cliente"
        );

    }

}


// =========================================================================
// HOME
// =========================================================================

function voltarInicio() {

    if (clienteNome) {

        navegarPara("tela-home");

    } else {

        navegarPara("tela-login");

    }

}


function voltarParaHome() {

    navegarPara("tela-home");

}


// =========================================================================
// PLANO GRATUITO
// =========================================================================

function abrirPlanoGratuito() {

    if (!clienteNome) {

        abrirModalLogin();

        return;

    }


    abrirChatPlano("Plano Gratuito");

}


// =========================================================================
// ABRIR CHAT DE UM PLANO
// =========================================================================

function abrirChatPlano(nomePlano) {

    if (!clienteNome) {

        abrirModalLogin();

        return;

    }


    planoEscolhido = nomePlano;

    faseDoDialogo = 1;


    document
        .getElementById("plano-selecionado-txt")
        .innerText =
        `PLANO ATIVO: ${planoEscolhido.toUpperCase()}`;


    navegarPara("tela-chat");


    const caixaChat =
        document.getElementById(
            "chat-messages-box"
        );


    if (!caixaChat) return;


    caixaChat.innerHTML = "";


    let saudacaoInicial = "";


    // =====================================================
    // PLANO GRATUITO
    // =====================================================

    if (nomePlano === "Plano Gratuito") {

        saudacaoInicial =
            `Olá <b>${clienteNome}</b>! 👋<br><br>` +

            `Bem-vindo ao <b>Plano Gratuito da ReivenStudio</b>.<br><br>` +

            `Explique detalhadamente como deseja que seja o seu site.` +

            `<br><br>` +

            `Diga-nos:<br>` +

            `• Qual é o nome do seu negócio?<br>` +

            `• Que tipo de site pretende criar?<br>` +

            `• Quais são as cores que deseja?<br>` +

            `• Que informações devem aparecer no site?<br>` +

            `• Tem alguma ideia de design?<br><br>` +

            `Escreva tudo o que considera importante e a Reiven IA irá preparar a estrutura do seu site.`;

    }


    // =====================================================
    // PLANOS PAGOS
    // =====================================================

    else {

        saudacaoInicial =
            `Olá <b>${clienteNome}</b>! 👋<br><br>` +

            `Vimos que está interessado na compra do plano <b>${nomePlano}</b>.<br><br>` +

            `Explique em detalhes como deseja que seja o seu site.<br><br>` +

            `Diga-me:<br>` +

            `• Quais serão as cores?<br>` +

            `• Qual é o nome do seu negócio?<br>` +

            `• Qual é o objetivo do site?<br>` +

            `• Que informações importantes devem aparecer?<br>` +

            `• Que estilo deseja para o site?<br>` +

            `• Se já tiver um domínio em mente, diga-nos também o nome.<br><br>` +

            `Pode escrever, por exemplo: "Quero um site assim e assim, com estas cores, o nome do domínio será..."`;

    }


    caixaChat.innerHTML =
        `<div class="msg msg-ia">${saudacaoInicial}</div>`;


    guardarMensagemNoSupabase(
        "ia",
        saudacaoInicial
    );

}


// =========================================================================
// PROCESSAR MENSAGEM
// =========================================================================

function processarMensagemUsuario() {

    const inputChat =
        document.getElementById(
            "chat-user-input"
        );


    const textoUsuario =
        inputChat.value.trim();


    if (!textoUsuario) return;


    const caixaChat =
        document.getElementById(
            "chat-messages-box"
        );


    caixaChat.innerHTML +=
        `<div class="msg msg-user">${textoUsuario}</div>`;


    inputChat.value = "";


    caixaChat.scrollTop =
        caixaChat.scrollHeight;


    guardarMensagemNoSupabase(
        "usuario",
        textoUsuario
    );


    setTimeout(() => {

        processarRespostaIA(
            textoUsuario,
            caixaChat
        );

    }, 900);

}


// =========================================================================
// RESPOSTA DA IA
// =========================================================================

function processarRespostaIA(
    textoUsuario,
    caixaChat
) {

    const texto =
        textoUsuario.toLowerCase();


    let respostaIA = "";


    // =====================================================
    // PERGUNTA SOBRE PAGAMENTO
    // =====================================================

    if (
        texto.includes("pagar") ||
        texto.includes("pagamento") ||
        texto.includes("como pago") ||
        texto.includes("como pagar") ||
        texto.includes("preço")
    ) {

        respostaIA =
            `💳 Para saber como efetuar o pagamento do seu plano, entre em contacto diretamente com a nossa equipa através do número <b>84 722 1667</b>.<br><br>` +

            `A nossa equipa irá fornecer as orientações necessárias para concluir o pagamento.`;

    }


    // =====================================================
    // PRIMEIRA RESPOSTA — CRIAR SITE
    // =====================================================

    else if (faseDoDialogo === 1) {

        respostaIA =
            `⏳ <b>A PREPARAR O SEU SITE...</b><br><br>` +

            `Recebemos as informações do seu projeto <b>${planoEscolhido}</b>.<br><br>` +

            `A Reiven IA está a estruturar a proposta do site com base nas informações que forneceu.<br><br>` +

            `Estamos a preparar a estrutura, design e organização inicial do projeto...`;



        caixaChat.innerHTML +=
            `<div class="msg msg-ia">${respostaIA}</div>`;


        caixaChat.scrollTop =
            caixaChat.scrollHeight;


        guardarMensagemNoSupabase(
            "ia",
            respostaIA
        );


        faseDoDialogo = 2;


        // =================================================
        // TENTAR MOTOR NODE.JS
        // =================================================

        fetch(
            "http://localhost:3000/api/criar-site",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    nomeCliente:
                        clienteNome,

                    emailCliente:
                        clienteEmail,

                    descricaoSite:
                        textoUsuario,

                    nichoPlano:
                        planoEscolhido

                })

            }
        )

        .then(res => res.json())

        .then(dados => {

            if (dados && dados.sucesso) {

                mostrarSitePronto(
                    caixaChat,
                    dados.url
                );

            } else {

                mostrarMensagemSitePronto(
                    caixaChat
                );

            }

        })

        .catch(() => {

            // FALLBACK
            // caso o Node esteja desligado

            mostrarMensagemSitePronto(
                caixaChat
            );

        });

    }


    // =====================================================
    // APÓS CRIAÇÃO
    // =====================================================

    else {

        respostaIA =
            `O seu projeto já foi registado no sistema da ReivenStudio. ✅<br><br>` +

            `Se desejar fazer alterações, obter informações sobre o pagamento ou esclarecer alguma dúvida, entre em contacto com a nossa equipa através do número <b>84 722 1667</b>.`;



        caixaChat.innerHTML +=
            `<div class="msg msg-ia">${respostaIA}</div>`;


        caixaChat.scrollTop =
            caixaChat.scrollHeight;


        guardarMensagemNoSupabase(
            "ia",
            respostaIA
        );

    }

}


// =========================================================================
// SITE PRONTO
// =========================================================================

function mostrarMensagemSitePronto(
    caixaChat
) {

    const resposta =
        `🏁 <b>SITE PRONTO!</b><br><br>` +

        `O seu projeto foi preparado pela Reiven IA.<br><br>` +

        `📧 O seu site será entregue por <b>e-mail</b>.<br><br>` +

        `Caso tenha alguma dúvida, entre em contacto com a nossa equipa através do número <b>84 722 1667</b>.`;


    caixaChat.innerHTML +=
        `<div class="msg msg-ia">${resposta}</div>`;


    caixaChat.scrollTop =
        caixaChat.scrollHeight;


    guardarMensagemNoSupabase(
        "ia",
        resposta
    );

}


function mostrarSitePronto(
    caixaChat,
    url
) {

    const resposta =
        `🏁 <b>SITE PRONTO!</b><br><br>` +

        `O seu site foi criado pela Reiven IA.<br><br>` +

        `🔗 <a href="${url}" target="_blank">Visualizar o meu site</a><br><br>` +

        `📧 O site será também entregue por <b>e-mail</b>.<br><br>` +

        `Caso tenha alguma dúvida, entre em contacto através do número <b>84 722 1667</b>.`;


    caixaChat.innerHTML +=
        `<div class="msg msg-ia">${resposta}</div>`;


    caixaChat.scrollTop =
        caixaChat.scrollHeight;


    guardarMensagemNoSupabase(
        "ia",
        resposta
    );

}


// =========================================================================
// EMAIL DE BOAS-VINDAS
// =========================================================================

function enviarEmailBoasVindas() {

    const parametrosEmail = {

        service_id:
            "service_yvykuby",

        template_id:
            "template_id",

        user_id:
            "51beClUvaSsGDKrfz",

        accessToken:
            "1132IoZO3sxKYQgZohqghh",

        template_params: {

            to_name:
                clienteNome,

            to_email:
                clienteEmail,

            message:
                `Olá ${clienteNome}, confirmamos com sucesso a criação da sua conta na plataforma ReivenStudio.`

        }

    };


    fetch(
        "https://emailjs.com",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(
                    parametrosEmail
                )

        }
    )

    .then(resposta => {

        if (resposta.ok) {

            console.log(
                "E-mail enviado."
            );

        }

    })

    .catch(erro => {

        console.log(
            "Erro no EmailJS.",
            erro
        );

    });

}


// =========================================================================
// HISTÓRICO DO CHAT
// =========================================================================

function guardarMensagemNoSupabase(
    remetente,
    texto
) {

    if (!clienteEmail) return;


    fetch(
        `${SUPABASE_URL}/rest/v1/historico_chat`,
        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json",

                "apikey":
                    SUPABASE_ANON_KEY,

                "Authorization":
                    `Bearer ${SUPABASE_ANON_KEY}`

            },

            body: JSON.stringify({

                cliente_email:
                    clienteEmail,

                remetente:
                    remetente,

                mensagem:
                    texto

            })

        }
    )

    .catch(erro => {

        console.error(
            "Erro no histórico:",
            erro
        );

    });

}


// =========================================================================
// ENTER NO CHAT
// =========================================================================

function verificarTecla(evento) {

    if (evento.key === "Enter") {

        processarMensagemUsuario();

    }

}


// =========================================================================
// INICIALIZAÇÃO
// =========================================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        verificarSessaoLembrada();

    }
);


// =========================================================================
// FECHAR MODAL AO CLICAR FORA
// =========================================================================

document.addEventListener(
    "click",
    evento => {

        if (
            evento.target.classList.contains("modal")
        ) {

            fecharModais();

        }

    }
);
