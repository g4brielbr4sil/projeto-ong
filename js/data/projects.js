export const projectsData = Object.freeze([
  {
    id: "educacao",
    number: "01",
    icon: "Aa",
    category: "Educação",
    pillarDescription: "Reforço escolar, inclusão digital e oficinas que abrem novas perspectivas para crianças e jovens.",
    badge: { label: "Educação", modifier: "success" },
    preview: {
      label: "Educação",
      title: "Educação para Todos",
      description: "Aprender muda o jeito de ver o mundo.",
      image: "educacao",
      alt: "Estudantes em sala de aula acompanhando uma atividade",
      width: 900,
      height: 700
    },
    detail: {
      title: "Educação para Todos",
      image: "educacao",
      alt: "Professora orientando estudantes durante uma atividade em sala",
      lead: "Aprender não deveria depender do CEP. Criamos espaços acolhedores para ampliar repertórios e perspectivas.",
      objective: "Apoiar crianças e adolescentes no desenvolvimento escolar e no acesso consciente às ferramentas digitais.",
      activities: [
        "Reforço e acompanhamento escolar",
        "Oficinas de inclusão digital",
        "Circulação de livros e materiais"
      ],
      formArea: "educacao"
    }
  },
  {
    id: "alimentacao",
    number: "02",
    icon: "◒",
    category: "Segurança alimentar",
    pillarDescription: "Mobilização solidária para apoiar famílias com alimentos e fortalecer redes locais de cuidado.",
    badge: { label: "Segurança alimentar", modifier: "info" },
    preview: {
      label: "Alimentação",
      title: "Alimento que Transforma",
      image: "alimentacao",
      alt: "Voluntários separando alimentos para doação",
      width: 800,
      height: 520
    },
    detail: {
      title: "Alimento que Transforma",
      image: "alimentacao",
      alt: "Pessoas voluntárias organizando doações de alimentos",
      lead: "Cuidado também chega à mesa. Mobilizamos redes solidárias para apoiar famílias com respeito e proximidade.",
      objective: "Contribuir com a segurança alimentar e fortalecer uma rede comunitária de apoio contínuo.",
      activities: [
        "Campanhas de arrecadação",
        "Organização de cestas essenciais",
        "Distribuição comunitária responsável"
      ],
      formArea: "alimentacao"
    }
  },
  {
    id: "comunidade",
    number: "03",
    icon: "◎",
    category: "Inclusão social",
    pillarDescription: "Vivências, cultura e capacitação para promover autonomia, cidadania e pertencimento.",
    badge: { label: "Mobilização comunitária", modifier: "warm" },
    preview: {
      label: "Inclusão",
      title: "Comunidade em Movimento",
      image: "inclusao-social",
      alt: "Crianças reunidas em atividade comunitária",
      width: 800,
      height: 520
    },
    detail: {
      title: "Comunidade em Movimento",
      image: "inclusao-social",
      alt: "Crianças participando juntas de uma atividade comunitária",
      lead: "Pertencer também transforma. Criamos encontros que estimulam autonomia, convivência e participação cidadã.",
      objective: "Promover experiências coletivas que valorizem talentos locais, cultura e desenvolvimento comunitário.",
      activities: [
        "Oficinas de capacitação",
        "Atividades culturais e esportivas",
        "Rodas de conversa e orientação"
      ],
      formArea: "eventos"
    }
  }
]);
