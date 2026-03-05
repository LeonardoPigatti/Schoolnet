import { useState } from "react";

const FAQS = {
  "Acadêmico": [
    {
      q: "Como consulto minhas notas e faltas?",
      a: "Acesse o menu Secretaria → Notas e Faltas. Lá você encontra todas as disciplinas do semestre atual com notas e percentual de frequência.",
    },
    {
      q: "Qual é a frequência mínima exigida?",
      a: "A frequência mínima obrigatória é de 75% em cada disciplina. Abaixo disso o aluno é reprovado por falta, independentemente das notas.",
    },
    {
      q: "Como funciona a matriz curricular?",
      a: "A matriz curricular está disponível em Secretaria → Matriz Curricular. Ela exibe todas as disciplinas do seu curso organizadas por semestre.",
    },
    {
      q: "O que é DP Modular?",
      a: "DP (Dependência) Modular é quando o aluno precisa cursar novamente uma disciplina em que foi reprovado. Você pode acompanhar em DP Modular → Minhas DPs.",
    },
    {
      q: "Como consulto o horário das aulas?",
      a: "Acesse Secretaria → Horário de Aulas para visualizar sua grade horária semanal.",
    },
  ],
  "Financeiro": [
    {
      q: "Como acesso meu extrato financeiro?",
      a: "Acesse Financeiro → Extrato para visualizar todas as parcelas, vencimentos e situação de pagamento.",
    },
    {
      q: "O que é o PagFácil?",
      a: "O PagFácil é o sistema de cálculo de bolsas e geração de parcelas. Acesse Financeiro → PagFácil para ver seu desconto e boletos.",
    },
    {
      q: "Como funciona a bolsa de estudos?",
      a: "A bolsa é calculada com base na renda familiar, tipo de escola de origem e desempenho acadêmico. O percentual de desconto é aplicado automaticamente nas parcelas.",
    },
    {
      q: "Como compro créditos de impressão?",
      a: "Acesse seu perfil (canto superior direito) → Crédito de Impressão. Escolha um pacote e pague via PIX ou cartão.",
    },
  ],
  "Secretaria": [
    {
      q: "Como solicito documentos como declaração de matrícula?",
      a: "Acesse Requerimentos → Documentos. Os PDFs são gerados automaticamente com seus dados e ficam disponíveis para download imediato.",
    },
    {
      q: "Onde fica o calendário acadêmico?",
      a: "O calendário está disponível em Secretaria → Calendário Acadêmico com todas as datas importantes do semestre.",
    },
    {
      q: "Como faço a rematrícula?",
      a: "A rematrícula está disponível em Secretaria → Rematrícula durante o período definido no calendário acadêmico. Fique atento às datas.",
    },
    {
      q: "Onde encontro documentos institucionais?",
      a: "Em Secretaria → Documentos Institucionais você encontra regimento interno, estatuto, projetos pedagógicos e outros documentos oficiais.",
    },
  ],
  "TCC e Estágio": [
    {
      q: "Como cadastro meu TCC no portal?",
      a: "Acesse Atividades Acadêmicas → TCC. Preencha as 3 abas (Informações, Banca e Arquivo), salve como rascunho e depois envie para análise quando estiver pronto.",
    },
    {
      q: "Posso editar o TCC depois de enviar?",
      a: "Não. Após clicar em 'Enviar para Análise' o TCC fica bloqueado para edição. Edite e revise antes de enviar.",
    },
    {
      q: "Como cadastro meu estágio?",
      a: "Acesse Atividades Acadêmicas → Estágio. Preencha os dados da empresa, supervisor e período. Você também pode enviar documentos como termo de compromisso e relatórios.",
    },
    {
      q: "Quantas horas de atividades complementares preciso?",
      a: "O mínimo exigido é de 200 horas aprovadas. Acompanhe seu progresso em Atividades Acadêmicas → Atividades Complementares.",
    },
    {
      q: "Quais são os requisitos para emitir o diploma?",
      a: "Você precisa ter todas as disciplinas aprovadas, estágio com status 'Concluído' e pelo menos 200 horas de atividades complementares aprovadas. Acompanhe em Requerimentos → Diploma.",
    },
  ],
  "Sistema/Portal": [
    {
      q: "Como altero minha senha?",
      a: "Clique no seu nome no canto superior direito → Alterar Senha. Informe a senha atual e a nova senha (mínimo 6 caracteres).",
    },
    {
      q: "Como atualizo minha foto de perfil?",
      a: "Acesse seu perfil pelo menu superior → Perfil. Clique em 'Editar perfil' e depois no ícone de câmera sobre o avatar.",
    },
    {
      q: "O portal funciona no celular?",
      a: "Sim, o Schoolnet é responsivo e funciona em dispositivos móveis. Para melhor experiência recomendamos usar em telas maiores.",
    },
    {
      q: "Perdi acesso ao sistema, o que faço?",
      a: "Entre em contato com a secretaria acadêmica pessoalmente ou pelo e-mail institucional para redefinição de acesso.",
    },
    {
      q: "Como contesto uma ocorrência?",
      a: "Acesse seu perfil → Ocorrências. Clique na ocorrência desejada para expandir e use o botão 'Contestar esta ocorrência' se ela estiver com status Pendente ou Em Análise.",
    },
  ],
};

const CAT_ICONS = {
  "Acadêmico":     "🎓",
  "Financeiro":    "💰",
  "Secretaria":    "🏛",
  "TCC e Estágio": "📝",
  "Sistema/Portal":"⚙️",
};

export default function PerguntasFrequentes() {
  const [categoriaSel, setCategoriaSel] = useState("Acadêmico");
  const [aberto, setAberto] = useState(null);
  const [busca, setBusca] = useState("");

  const categorias = Object.keys(FAQS);

  const isBuscando = busca.trim().length > 0;
  const resultadosBusca = isBuscando
    ? Object.entries(FAQS).flatMap(([cat, perguntas]) =>
        perguntas
          .filter(p => p.q.toLowerCase().includes(busca.toLowerCase()) || p.a.toLowerCase().includes(busca.toLowerCase()))
          .map(p => ({ ...p, cat }))
      )
    : [];

  const perguntasAtivas = isBuscando ? null : FAQS[categoriaSel];

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>❓</div>
          <div>
            <div style={S.headerTitle}>Perguntas Frequentes</div>
            <div style={S.headerSub}>Portal Acadêmico</div>
          </div>
        </div>
      </header>

      <div style={S.page}>
        {/* BUSCA */}
        <div style={S.buscaWrap}>
          <span style={S.buscaIcon}>🔍</span>
          <input
            style={S.buscaInput}
            placeholder="Busque por palavras-chave... ex: nota, bolsa, TCC"
            value={busca}
            onChange={e => { setBusca(e.target.value); setAberto(null); }}
          />
          {busca && (
            <button style={S.buscaClear} onClick={() => setBusca("")}>✕</button>
          )}
        </div>

        {/* RESULTADO DA BUSCA */}
        {isBuscando ? (
          <div>
            <div style={S.buscaResultLabel}>
              {resultadosBusca.length > 0
                ? `${resultadosBusca.length} resultado${resultadosBusca.length > 1 ? "s" : ""} encontrado${resultadosBusca.length > 1 ? "s" : ""}`
                : "Nenhum resultado encontrado"}
            </div>
            {resultadosBusca.length === 0 ? (
              <div style={S.emptyCard}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔎</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Nada encontrado</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Tente outros termos ou entre em contato com a secretaria.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {resultadosBusca.map((item, i) => (
                  <FaqItem
                    key={i}
                    item={item}
                    index={`busca-${i}`}
                    aberto={aberto === `busca-${i}`}
                    onToggle={() => setAberto(aberto === `busca-${i}` ? null : `busca-${i}`)}
                    tag={item.cat}
                    tagIcon={CAT_ICONS[item.cat]}
                    busca={busca}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={S.layout}>
            {/* SIDEBAR CATEGORIAS */}
            <div style={S.sidebar}>
              {categorias.map(cat => (
                <button
                  key={cat}
                  style={{ ...S.catBtn, ...(categoriaSel === cat ? S.catBtnAtivo : {}) }}
                  onClick={() => { setCategoriaSel(cat); setAberto(null); }}
                >
                  <span style={S.catBtnIcon}>{CAT_ICONS[cat]}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>{cat}</span>
                  <span style={S.catCount}>{FAQS[cat].length}</span>
                </button>
              ))}
            </div>

            {/* PERGUNTAS */}
            <div style={S.conteudo}>
              <div style={S.conteudoHeader}>
                <span style={{ fontSize: 22 }}>{CAT_ICONS[categoriaSel]}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{categoriaSel}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{perguntasAtivas.length} perguntas</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {perguntasAtivas.map((item, i) => (
                  <FaqItem
                    key={i}
                    item={item}
                    index={i}
                    aberto={aberto === i}
                    onToggle={() => setAberto(aberto === i ? null : i)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RODAPÉ */}
        <div style={S.rodape}>
          <span style={{ fontSize: 18 }}>💬</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Não encontrou o que precisava?</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              Entre em contato com a secretaria acadêmica pessoalmente ou pelo e-mail institucional.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function highlight(texto, busca) {
  if (!busca) return texto;
  const partes = texto.split(new RegExp(`(${busca})`, "gi"));
  return partes.map((p, i) =>
    p.toLowerCase() === busca.toLowerCase()
      ? <mark key={i} style={{ background: "rgba(91,108,255,0.3)", color: "#a78bfa", borderRadius: 3, padding: "0 2px" }}>{p}</mark>
      : p
  );
}

function FaqItem({ item, index, aberto, onToggle, tag, tagIcon, busca }) {
  return (
    <div style={{ ...S.faqCard, ...(aberto ? S.faqAberto : {}) }}>
      <div style={S.faqTopo} onClick={onToggle}>
        <div style={{ flex: 1 }}>
          {tag && (
            <div style={S.faqTag}>{tagIcon} {tag}</div>
          )}
          <div style={S.faqPergunta}>{busca ? highlight(item.q, busca) : item.q}</div>
        </div>
        <div style={{ ...S.faqChevron, transform: aberto ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
      </div>
      {aberto && (
        <div style={S.faqResposta}>
          {busca ? highlight(item.a, busca) : item.a}
        </div>
      )}
    </div>
  );
}

const S = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0" },
  header: { background: "#15181f", borderBottom: "1px solid #252a38", padding: "16px 28px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#5b6cff,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  headerTitle: { fontWeight: 700, fontSize: 15 },
  headerSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  page: { maxWidth: 960, margin: "0 auto", padding: "32px 20px" },
  buscaWrap: { position: "relative", display: "flex", alignItems: "center", marginBottom: 28 },
  buscaIcon: { position: "absolute", left: 16, fontSize: 16, pointerEvents: "none" },
  buscaInput: { width: "100%", background: "#15181f", border: "1px solid #252a38", borderRadius: 12, color: "#e8eaf0", fontFamily: "inherit", fontSize: 14, padding: "13px 44px", outline: "none" },
  buscaClear: { position: "absolute", right: 14, background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 14 },
  buscaResultLabel: { fontSize: 12, color: "#6b7280", marginBottom: 14, fontWeight: 600 },
  layout: { display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" },
  sidebar: { display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 80 },
  catBtn: { display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "1px solid transparent", borderRadius: 10, background: "none", color: "#6b7280", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" },
  catBtnAtivo: { background: "#15181f", border: "1px solid #252a38", color: "#e8eaf0" },
  catBtnIcon: { fontSize: 16, width: 22, textAlign: "center" },
  catCount: { background: "#1c202b", borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 700, color: "#6b7280" },
  conteudo: {},
  conteudoHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "16px 20px", background: "#15181f", border: "1px solid #252a38", borderRadius: 12 },
  faqCard: { background: "#15181f", border: "1px solid #252a38", borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" },
  faqAberto: { borderColor: "#5b6cff44" },
  faqTopo: { display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" },
  faqTag: { fontSize: 11, color: "#a78bfa", fontWeight: 600, marginBottom: 4 },
  faqPergunta: { fontWeight: 600, fontSize: 14, lineHeight: 1.4 },
  faqChevron: { color: "#6b7280", fontSize: 11, flexShrink: 0, transition: "transform 0.2s" },
  faqResposta: { padding: "0 18px 16px 18px", fontSize: 13, color: "#9ca3af", lineHeight: 1.7, borderTop: "1px solid #1c202b", paddingTop: 14, marginTop: 0 },
  emptyCard: { background: "#15181f", border: "1px dashed #252a38", borderRadius: 14, padding: "52px 32px", textAlign: "center" },
  rodape: { display: "flex", alignItems: "center", gap: 16, marginTop: 36, padding: "20px 24px", background: "#15181f", border: "1px solid #252a38", borderRadius: 12 },
};