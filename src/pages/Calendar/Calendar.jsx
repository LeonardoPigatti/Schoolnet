import { useState, useEffect, useRef, useCallback } from "react";
import "./Calendar.css";

const API_URL = "http://localhost:5000";
const YEAR    = 2026;
const MESES   = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO",
                  "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
const TIPOS   = ["nao_letivo", "letivo", "feriado"];

function toKey(month, day) {
  return `${YEAR}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

function gerarDias(month) {
  const firstDay    = new Date(YEAR, month, 1).getDay();
  const daysInMonth = new Date(YEAR, month+1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function getDiaSemana(month, day) {
  return new Date(YEAR, month, day).getDay(); // 0=dom, 6=sab
}

// ── Modal feriados sugeridos ────────────────────────────────────────
function ModalSugestoes({ sugestoes, onAplicar, onFechar }) {
  const [sel, setSel] = useState(sugestoes.map(s => ({ ...s, checked: true })));
  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-titulo">Feriados Nacionais Sugeridos — {YEAR}</h3>
        <p className="modal-desc">Selecione quais deseja incluir:</p>
        <div className="sugestoes-lista">
          {sel.map((s, i) => (
            <label key={s.data} className="sugestao-item">
              <input type="checkbox" checked={s.checked}
                onChange={() => setSel(p => p.map((x,j) => j===i ? {...x,checked:!x.checked} : x))} />
              <span className="sugestao-data">{s.data}</span>
              <span className="sugestao-desc">{s.descricao}</span>
            </label>
          ))}
        </div>
        <div className="modal-acoes">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-salvar" onClick={() => onAplicar(sel.filter(s=>s.checked))}>
            Aplicar Selecionados
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal intervalo de datas ────────────────────────────────────────
function ModalIntervalo({ onAplicar, onFechar }) {
  const [de,   setDe]   = useState("");
  const [ate,  setAte]  = useState("");
  const [tipo, setTipo] = useState("nao_letivo");
  const [erro, setErro] = useState("");

  function handleAplicar() {
    if (!de || !ate) { setErro("Preencha as duas datas."); return; }
    if (de > ate)    { setErro("Data inicial maior que a final."); return; }
    onAplicar(de, ate, tipo);
    onFechar();
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
        <h3 className="modal-titulo">Definir Intervalo de Datas</h3>
        <label className="modal-label">De</label>
        <input className="modal-input" type="date" value={de} onChange={e=>setDe(e.target.value)}
          min={`${YEAR}-01-01`} max={`${YEAR}-12-31`} />
        <label className="modal-label">Até</label>
        <input className="modal-input" type="date" value={ate} onChange={e=>setAte(e.target.value)}
          min={`${YEAR}-01-01`} max={`${YEAR}-12-31`} />
        <label className="modal-label">Tipo</label>
        <select className="modal-input" value={tipo} onChange={e=>setTipo(e.target.value)}>
          <option value="nao_letivo">Não Letivo</option>
          <option value="letivo">Letivo</option>
          <option value="feriado">Feriado</option>
        </select>
        {erro && <p className="modal-erro">{erro}</p>}
        <div className="modal-acoes">
          <button className="btn-cancelar" onClick={onFechar}>Cancelar</button>
          <button className="btn-salvar" onClick={handleAplicar}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────
export default function Calendar({ usuario }) {
  const [diasMap,        setDiasMap]        = useState({});
  const [sugestoes,      setSugestoes]      = useState([]);
  const [carregando,     setCarregando]     = useState(true);
  const [salvando,       setSalvando]       = useState(false);
  const [mensagem,       setMensagem]       = useState("");
  const [pincel,         setPincel]         = useState(null);      // tipo ativo do pincel
  const [historico,      setHistorico]      = useState([]);        // para Ctrl+Z
  const [arrastar,       setArrastar]       = useState(false);     // mouse pressionado
  const [modalSugestoes, setModalSugestoes] = useState(false);
  const [modalIntervalo, setModalIntervalo] = useState(false);
  const arrastarRef = useRef(false);

  const ehCoordenador = usuario?.tipoProfessor === "coordenador";
  const cursoId       = usuario?.perfil === "aluno"
    ? usuario?.cursoId
    : usuario?.cursoCoordenado;

  // ── Carregar ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!cursoId) { setCarregando(false); return; }
    fetch(`${API_URL}/calendario/${cursoId}`)
      .then(r => r.json())
      .then(dados => {
        const map = {};
        dados.dias.forEach(d => { map[d.data.slice(0,10)] = { tipo: d.tipo, descricao: d.descricao||"" }; });
        setDiasMap(map);
        setSugestoes(dados.sugestoes || []);
      })
      .catch(()=>{})
      .finally(()=>setCarregando(false));
  }, [cursoId]);

  // ── Ctrl+Z ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ehCoordenador) return;
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        setHistorico(prev => {
          if (!prev.length) return prev;
          const ant = prev[prev.length-1];
          setDiasMap(ant);
          return prev.slice(0,-1);
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ehCoordenador]);

  // ── Parar arrasto ao soltar mouse em qualquer lugar ───────────────
  useEffect(() => {
    function onMouseUp() { arrastarRef.current = false; setArrastar(false); }
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  // ── Aplicar tipo num dia (salva histórico) ────────────────────────
  function aplicarDia(key, tipo) {
    setDiasMap(prev => {
      setHistorico(h => [...h.slice(-30), prev]); // guarda até 30 estados
      return { ...prev, [key]: { tipo, descricao: prev[key]?.descricao || "" } };
    });
  }

  function aplicarDias(keys, tipo) {
    setDiasMap(prev => {
      setHistorico(h => [...h.slice(-30), prev]);
      const novo = { ...prev };
      keys.forEach(k => { novo[k] = { tipo, descricao: prev[k]?.descricao || "" }; });
      return novo;
    });
  }

  // ── Clique / arrasto no dia ───────────────────────────────────────
  function handleMouseDown(month, day) {
    if (!ehCoordenador || !day) return;
    arrastarRef.current = true;
    setArrastar(true);
    const key = toKey(month, day);
    if (pincel) {
      aplicarDia(key, pincel);
    } else {
      const atual  = diasMap[key]?.tipo ?? "nao_letivo";
      const proximo = TIPOS[(TIPOS.indexOf(atual)+1) % TIPOS.length];
      aplicarDia(key, proximo);
    }
  }

  function handleMouseEnter(month, day) {
    if (!ehCoordenador || !day || !arrastarRef.current || !pincel) return;
    const key = toKey(month, day);
    setDiasMap(prev => ({ ...prev, [key]: { tipo: pincel, descricao: prev[key]?.descricao||"" } }));
  }

  // ── Atalhos de distribuição ───────────────────────────────────────
  function aplicarDomingos(tipo) {
    const keys = [];
    for (let m = 0; m < 12; m++) {
      const total = new Date(YEAR, m+1, 0).getDate();
      for (let d = 1; d <= total; d++) {
        if (getDiaSemana(m, d) === 0) keys.push(toKey(m, d));
      }
    }
    aplicarDias(keys, tipo);
  }

  function aplicarDiasSemana(tipo) {
    const keys = [];
    for (let m = 0; m < 12; m++) {
      const total = new Date(YEAR, m+1, 0).getDate();
      for (let d = 1; d <= total; d++) {
        const dow = getDiaSemana(m, d);
        if (dow >= 1 && dow <= 5) keys.push(toKey(m, d));
      }
    }
    aplicarDias(keys, tipo);
  }

  function aplicarSabados(tipo) {
    const keys = [];
    for (let m = 0; m < 12; m++) {
      const total = new Date(YEAR, m+1, 0).getDate();
      for (let d = 1; d <= total; d++) {
        if (getDiaSemana(m, d) === 6) keys.push(toKey(m, d));
      }
    }
    aplicarDias(keys, tipo);
  }

  function aplicarIntervalo(de, ate, tipo) {
    const keys = [];
    for (let m = 0; m < 12; m++) {
      const total = new Date(YEAR, m+1, 0).getDate();
      for (let d = 1; d <= total; d++) {
        const k = toKey(m, d);
        if (k >= de && k <= ate) keys.push(k);
      }
    }
    aplicarDias(keys, tipo);
  }

  function aplicarSugestoes(selecionados) {
    setDiasMap(prev => {
      setHistorico(h => [...h.slice(-30), prev]);
      const novo = { ...prev };
      selecionados.forEach(s => { novo[s.data] = { tipo: "feriado", descricao: s.descricao }; });
      return novo;
    });
    setModalSugestoes(false);
  }

  // ── Copiar mês ────────────────────────────────────────────────────
  function copiarMes(origem, destino) {
    const totalOrigem  = new Date(YEAR, origem+1, 0).getDate();
    const totalDestino = new Date(YEAR, destino+1, 0).getDate();
    const keys = [];
    const tipos = [];
    for (let d = 1; d <= Math.min(totalOrigem, totalDestino); d++) {
      keys.push(toKey(destino, d));
      const ko = toKey(origem, d);
      tipos.push(diasMap[ko]?.tipo ?? "nao_letivo");
    }
    setDiasMap(prev => {
      setHistorico(h => [...h.slice(-30), prev]);
      const novo = { ...prev };
      keys.forEach((k, i) => { novo[k] = { tipo: tipos[i], descricao: "" }; });
      return novo;
    });
  }

  // ── Contadores ───────────────────────────────────────────────────
  const contadores = { letivo: 0, nao_letivo: 0, feriado: 0 };
  for (let m = 0; m < 12; m++) {
    const total = new Date(YEAR, m+1, 0).getDate();
    for (let d = 1; d <= total; d++) {
      const k = toKey(m, d);
      const t = diasMap[k]?.tipo ?? "nao_letivo";
      contadores[t]++;
    }
  }

  // ── Salvar ────────────────────────────────────────────────────────
  async function handleSalvar() {
    setSalvando(true); setMensagem("");
    try {
      const dias = Object.entries(diasMap).map(([data, val]) => ({
        data, tipo: val.tipo, descricao: val.descricao,
      }));
      const res   = await fetch(`${API_URL}/calendario/${cursoId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dias, ano: YEAR }),
      });
      const dados = await res.json();
      setMensagem(dados.mensagem ?? "Salvo!");
      setTimeout(() => setMensagem(""), 3000);
    } catch { setMensagem("Erro ao salvar."); }
    finally  { setSalvando(false); }
  }

  if (carregando) return <div className="calendar-container"><p>Carregando...</p></div>;

  return (
    <div className="calendar-container" onMouseUp={() => { arrastarRef.current=false; setArrastar(false); }}>

      {/* ── Topo ── */}
      <div className="calendar-top">
        <div>
          <h1>Calendário Acadêmico</h1>
          {ehCoordenador && <p className="calendar-hint">Use as ferramentas abaixo ou clique/arraste nos dias</p>}
        </div>
        {ehCoordenador && (
          <div className="calendar-acoes">
            <button className="btn-sugestoes" onClick={() => setModalSugestoes(true)}>Feriados Sugeridos</button>
            <button className="btn-salvar-cal" onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar Calendário"}
            </button>
          </div>
        )}
      </div>

      {mensagem && <p className="calendar-mensagem">{mensagem}</p>}

      {/* ── Toolbar (só coordenador) ── */}
      {ehCoordenador && (
        <div className="toolbar">

          {/* Pincel */}
          <div className="toolbar-grupo">
            <span className="toolbar-label">Pincel</span>
            <div className="pincel-opcoes">
              {[null, "letivo", "nao_letivo", "feriado"].map(t => (
                <button
                  key={t ?? "ciclo"}
                  className={`btn-pincel ${pincel===t ? "ativo":""} ${t ? `pincel-${t}`:""}`}
                  onClick={() => setPincel(pincel===t ? null : t)}
                  title={t ? `Pincel: ${t.replace("_"," ")}` : "Ciclo (clique alterna tipo)"}
                >
                  {t ? "" : "↻ Ciclo"}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-sep" />

          {/* Atalhos */}
          <div className="toolbar-grupo">
            <span className="toolbar-label">Atalhos</span>
            <div className="atalhos-grid">
              <button className="btn-atalho" onClick={() => aplicarDomingos("nao_letivo")}>Domingos → Não letivo</button>
              <button className="btn-atalho" onClick={() => aplicarSabados("nao_letivo")}>Sábados → Não letivo</button>
              <button className="btn-atalho" onClick={() => aplicarDiasSemana("letivo")}>Seg–Sex → Letivo</button>
              <button className="btn-atalho" onClick={() => setModalIntervalo(true)}>Intervalo de datas…</button>
            </div>
          </div>

          <div className="toolbar-sep" />

          {/* Copiar mês */}
          <div className="toolbar-grupo">
            <span className="toolbar-label">Copiar mês</span>
            <CopiarMes meses={MESES} onCopiar={copiarMes} />
          </div>

          <div className="toolbar-sep" />

          {/* Desfazer */}
          <div className="toolbar-grupo">
            <span className="toolbar-label">Desfazer</span>
            <button
              className="btn-atalho btn-desfazer"
              onClick={() => {
                if (!historico.length) return;
                setDiasMap(historico[historico.length-1]);
                setHistorico(h => h.slice(0,-1));
              }}
              disabled={!historico.length}
            >
              ↩ Ctrl+Z ({historico.length})
            </button>
          </div>
        </div>
      )}

      {/* ── Grid de meses ── */}
      <div className="calendar-grid">
        {Array.from({length:12}, (_,month) => (
          <div key={month} className="calendar-card">
            <div className="calendar-header">{MESES[month]}/{YEAR}</div>
            <div className="week-days">
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><div key={d}>{d}</div>)}
            </div>
            <div className="days-grid">
              {gerarDias(month).map((day, i) => {
                const key  = day ? toKey(month, day) : null;
                const tipo = key ? (diasMap[key]?.tipo ?? "nao_letivo") : null;
                return (
                  <div
                    key={i}
                    className={["day", !day?"empty":"", tipo?`tipo-${tipo}`:"",
                      ehCoordenador&&day?"editavel":"", arrastar&&pincel?"arrastando":""].join(" ")}
                    title={diasMap[key]?.descricao || ""}
                    onMouseDown={() => handleMouseDown(month, day)}
                    onMouseEnter={() => handleMouseEnter(month, day)}
                  >
                    {day || ""}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Legenda com contadores ── */}
      <div className="legend">
        <h3>Legenda</h3>
        {[
          { tipo:"nao_letivo", label:"Não Letivos" },
          { tipo:"letivo",     label:"Letivos"     },
          { tipo:"feriado",    label:"Feriados"    },
        ].map(({ tipo, label }) => (
          <div
            key={tipo}
            className={`legend-item ${ehCoordenador?"legend-clicavel":""} ${pincel===tipo?"legend-ativo":""}`}
            onClick={() => ehCoordenador && setPincel(pincel===tipo ? null : tipo)}
            title={ehCoordenador ? `Ativar pincel: ${label}` : ""}
          >
            <div className={`legend-box ${tipo.replace("_","-")}`}></div>
            <span>{label}</span>
            <span className="legend-count">{contadores[tipo]}</span>
          </div>
        ))}
      </div>

      {/* ── Modais ── */}
      {modalSugestoes && (
        <ModalSugestoes sugestoes={sugestoes} onAplicar={aplicarSugestoes} onFechar={()=>setModalSugestoes(false)} />
      )}
      {modalIntervalo && (
        <ModalIntervalo onAplicar={aplicarIntervalo} onFechar={()=>setModalIntervalo(false)} />
      )}
    </div>
  );
}

// ── Sub-componente copiar mês ───────────────────────────────────────
function CopiarMes({ meses, onCopiar }) {
  const [de,  setDe]  = useState("0");
  const [ate, setAte] = useState("1");
  return (
    <div className="copiar-mes">
      <select className="sel-mes" value={de}  onChange={e=>setDe(e.target.value)}>
        {meses.map((m,i)=><option key={i} value={i}>{m}</option>)}
      </select>
      <span className="copiar-arrow">→</span>
      <select className="sel-mes" value={ate} onChange={e=>setAte(e.target.value)}>
        {meses.map((m,i)=><option key={i} value={i}>{m}</option>)}
      </select>
      <button className="btn-atalho" onClick={()=>onCopiar(Number(de), Number(ate))}>Copiar</button>
    </div>
  );
}

// TODO CORRIGIR EFICACIA DOS BOTOES 
// TODO CORRIGIR DIMENSIONAMENTO DA TELA 
// TODO CORRIGIR UM POUCO O VISUAL 