import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { hashPassword } from './auth';

let dbInstance: DatabaseSync | null = null;

export function toPlain<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'filipem2.sqlite');
  dbInstance = new DatabaseSync(dbPath);

  // Enable WAL mode for high performance concurrency
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  initDatabase(dbInstance);

  return dbInstance;
}

function initDatabase(db: DatabaseSync) {
  // 1. Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      avatar TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#DC2626',
      icon TEXT DEFAULT 'Gamepad2',
      parent_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);

  // 3. Tags
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );
  `);

  // 4. Articles
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      cover_caption TEXT,
      cover_source TEXT,
      author_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      published_at DATETIME,
      updated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reading_time INTEGER DEFAULT 5,
      views INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      meta_title TEXT,
      meta_description TEXT,
      canonical_url TEXT,
      og_image TEXT,
      sources_json TEXT,
      allow_comments INTEGER DEFAULT 1,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );
  `);

  // 5. Article Tags
  db.exec(`
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  // 6. Comments
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      parent_id INTEGER,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );
  `);

  // 7. Pages (Legal & Custom)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      meta_title TEXT,
      meta_description TEXT,
      is_system INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Site Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 9. Visual Builder Sections
  db.exec(`
    CREATE TABLE IF NOT EXISTS visual_builder_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_identifier TEXT NOT NULL DEFAULT 'home',
      type TEXT NOT NULL,
      title TEXT,
      subtitle TEXT,
      config_json TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      version_state TEXT DEFAULT 'published' -- 'published' or 'draft'
    );
  `);

  // 10. Media Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT,
      credit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 12. 301 Redirects
  db.exec(`
    CREATE TABLE IF NOT EXISTS redirects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_path TEXT UNIQUE NOT NULL,
      target_path TEXT NOT NULL,
      status_code INTEGER DEFAULT 301,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default data if empty
  seedDefaults(db);
}

function seedDefaults(db: DatabaseSync) {
  // Check users count
  const userCount = db.prepare('SELECT count(*) as cnt FROM users').get() as { cnt: number };
  if (userCount.cnt === 0) {
    const adminPass = hashPassword('admin123456');
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, bio, avatar)
      VALUES (?, ?, ?, 'superadmin', ?, ?)
    `).run(
      'Filipe M.',
      'admin@filipem2.com',
      adminPass,
      'Criador e editor-chefe do BLOG FILIPEM2. Apaixonado por tecnologia, games competitivos, cinema e trilhas sonoras épicas.',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    );
  }

  // Check categories count
  const catCount = db.prepare('SELECT count(*) as cnt FROM categories').get() as { cnt: number };
  if (catCount.cnt === 0) {
    const categoriesData = [
      { name: 'Games', slug: 'games', desc: 'Notícias, análises de jogos, lançamentos de PlayStation, Xbox, Nintendo e PC, jogos indies e guias completos.', color: '#DC2626', icon: 'Gamepad2', sort: 1 },
      { name: 'Músicas', slug: 'musicas', desc: 'Novidades do mundo musical, lançamentos de álbuns, críticas, rock, metal, pop, eletrônica, k-pop e grandes festivais.', color: '#F59E0B', icon: 'Music', sort: 2 },
      { name: 'Filmes', slug: 'filmes', desc: 'Críticas de cinema, lançamentos, trailers oficiais, bilheterias confiáveis e bastidores de Hollywood e produções nacionais.', color: '#E11D48', icon: 'Film', sort: 3 },
      { name: 'Séries', slug: 'series', desc: 'Tudo sobre produções de streaming, temporadas, análises detalhadas de episódios, renovações e cancelamentos.', color: '#8B5CF6', icon: 'Tv', sort: 4 },
      { name: 'Cultura Geek & Tecnologia', slug: 'cultura-geek-tecnologia', desc: 'Animes, mangás, inovação tecnológica, inteligência artificial, hardware e tendências da cultura pop.', color: '#3B82F6', icon: 'Cpu', sort: 5 }
    ];

    const insertCat = db.prepare(`
      INSERT INTO categories (name, slug, description, color, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const c of categoriesData) {
      insertCat.run(c.name, c.slug, c.desc, c.color, c.icon, c.sort);
    }
  }

  // Check tags count
  const tagCount = db.prepare('SELECT count(*) as cnt FROM tags').get() as { cnt: number };
  if (tagCount.cnt === 0) {
    const defaultTags = ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'PC Gaming', 'Indies', 'RPG', 'Cinema', 'Marvel', 'DC', 'Streaming', 'Netflix', 'Rock', 'Eletrônica', 'Inteligência Artificial', 'Hardware', 'Anime', 'Reviews'];
    const insertTag = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)');
    for (const t of defaultTags) {
      insertTag.run(t, t.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  }

  // Check articles count
  const articleCount = db.prepare('SELECT count(*) as cnt FROM articles').get() as { cnt: number };
  if (articleCount.cnt === 0) {
    seedArticles(db);
  }

  // Check pages count
  const pageCount = db.prepare('SELECT count(*) as cnt FROM pages').get() as { cnt: number };
  if (pageCount.cnt === 0) {
    seedLegalPages(db);
  }

  // Check site settings
  const settingsCount = db.prepare('SELECT count(*) as cnt FROM site_settings').get() as { cnt: number };
  if (settingsCount.cnt === 0) {
    seedSettings(db);
  }

  // Check visual builder sections
  const sectionsCount = db.prepare('SELECT count(*) as cnt FROM visual_builder_sections').get() as { cnt: number };
  if (sectionsCount.cnt === 0) {
    seedBuilderSections(db);
  }
}

function seedArticles(db: DatabaseSync) {
  const admin = db.prepare('SELECT id FROM users LIMIT 1').get() as { id: number };
  const cats = db.prepare('SELECT id, slug FROM categories').all() as Array<{ id: number; slug: string }>;
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  const sampleArticles = [
    {
      title: 'A Nova Era dos RPGs de Ação: Como a Próxima Geração Está Redefinindo Mundos Abertos',
      subtitle: 'Gráficos hiper-realistas, inteligência artificial em NPCs e combate sem telas de carregamento marcam nova fase da indústria.',
      slug: 'a-nova-era-dos-rpgs-de-acao-geracao-mundos-abertos',
      category_id: catMap['games'] || 1,
      cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      cover_caption: 'Captura ilustrativa de ambientação futurista em mundos abertos interativos.',
      cover_source: 'Acervo Editorial / Divulgação',
      featured: 1,
      reading_time: 6,
      views: 1420,
      excerpt: 'Mundos dinâmicos com ciclos climáticos reais e sistemas neurais de comportamento colocam os jogadores no centro de narrativas verdadeiramente vivas.',
      content: `
        <p class="lead">A indústria dos jogos eletrônicos atingiu um ponto de inflexão fascinante. Se na década passada o conceito de "mundo aberto" muitas vezes significava colecionar centenas de ícones repetitivos espalhados por um mapa imenso, hoje os principais estúdios globais estão adotando uma filosofia radicalmente diferente: densidade narrativa, física contextual e inteligência artificial adaptativa.</p>
        
        <h2>Física Avançada e Sem Telas de Transição</h2>
        <p>Graças à consolidação dos SSDs ultrarrápidos de última geração e motores gráficos de ponta como a Unreal Engine 5, os limites entre cenários internos e externos praticamente desapareceram. Cidades virtuais agora respiram sem quedas bruscas de taxa de quadros, permitindo que cada edifício seja explorável e cada cidadão digital tenha rotinas plausíveis de trabalho, descanso e interação.</p>

        <blockquote>"O verdadeiro salto geracional não é apenas a contagem de polígonos na tela, mas sim a capacidade do mundo de reagir de forma convincente às escolhas impulsivas do jogador."</blockquote>

        <h2>O Papel dos Algoritmos na Criação de Desafios</h2>
        <p>Inimigos que aprendem com o estilo de jogo do usuário deixaram de ser ficção científica. Novos modelos comportamentais analisam padrões táticos: se o jogador abusa de esquivas ou ataques à distância, os oponentes rapidamente se reagrupam em flancos para cortar rotas de fuga. O resultado é um combate muito mais orgânico, tenso e recompensador.</p>

        <h2>Perspectivas para os Próximos Anos</h2>
        <p>Com os novos anúncios previstos para os grandes festivais internacionais de jogos, a expectativa é que essa revolução atinja também produções independentes com escopos mais focados, garantindo diversidade de propostas e experiências inesquecíveis para todos os perfis de entusiastas.</p>
      `,
      sources_json: JSON.stringify([
        { title: 'Game Developers Conference (GDC) Reports', url: 'https://gdconf.com' },
        { title: 'Digital Foundry Tech Reviews', url: 'https://www.eurogamer.net/digitalfoundry' }
      ]),
      tags: ['PC Gaming', 'PlayStation 5', 'Xbox Series X', 'RPG']
    },
    {
      title: 'O Ressurgimento dos Sintetizadores e da Estética Retrô na Música Contemporânea',
      subtitle: 'Como timbres vintage dos anos 80 combinados com batidas futuristas estão dominando as paradas globais de streaming.',
      slug: 'ressurgimento-sintetizadores-estetica-retro-musica-contemporanea',
      category_id: catMap['musicas'] || 2,
      cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      cover_caption: 'Painel de sintetizadores modulares analógicos em estúdio profissional.',
      cover_source: 'Estúdio / Divulgação Musical',
      featured: 1,
      reading_time: 4,
      views: 980,
      excerpt: 'Da synthwave aos novos lançamentos de grandes nomes do pop internacional, a paixão por instrumentos analógicos ganha roupagem moderna.',
      content: `
        <p class="lead">O que faz um timbre sintetizado criado há mais de quatro décadas soar mais moderno do que nunca nos fones de ouvido dos jovens de hoje? A resposta está na confluência entre calor analógico e precisão digital.</p>
        
        <h2>A Busca Pela Textura Orgânica</h2>
        <p>Em um mercado amplamente dominado por instrumentos virtuais hiper-polidos, produtores musicais de renome estão retornando aos circuitos com pequenas imperfeições sonoras: o calor das válvulas, a oscilação suave de frequência e o grave encorpado dos lendários modelos Roland Juno e Moog.</p>

        <h2>Impacto nas Trilhas Sonoras de Games e Séries</h2>
        <p>Essa tendência transcende os álbuns de estúdio e é o coração pulsante das trilhas sonoras mais cultuadas do cinema contemporâneo e de jogos com temáticas cyberpunk e neon-noir. O som eletrônico retrô não é apenas nostalgia; é um manifesto estético sobre como enxergamos o futuro com as lentes do passado.</p>
      `,
      sources_json: JSON.stringify([
        { title: 'Sound On Sound Magazine Analysis', url: 'https://www.soundonsound.com' },
        { title: 'Billboard Global Charts', url: 'https://www.billboard.com' }
      ]),
      tags: ['Rock', 'Eletrônica']
    },
    {
      title: 'Cinematografia Digital vs Película: Como Grandes Diretores Estão Filmando a Nova Ficção Científica',
      subtitle: 'Câmeras de altíssima resolução, lentes anamórficas e iluminação em volumes de LED transformam a narrativa visual nos cinemas.',
      slug: 'cinematografia-digital-vs-pelicula-ficcao-cientifica',
      category_id: catMap['filmes'] || 3,
      cover_image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      cover_caption: 'Equipamento de filmagem cinematográfica profissional em estúdio.',
      cover_source: 'Acervo Cinematográfico / Divulgação',
      featured: 0,
      reading_time: 5,
      views: 750,
      excerpt: 'Uma análise detalhada das decisões técnicas e artísticas que constroem a atmosfera visual das maiores obras de ficção científica deste ano.',
      content: `
        <p class="lead">O cinema de ficção científica sempre foi o laboratório onde a técnica encontra o sonho humano. Nos últimos anos, uma verdadeira revolução visual tomou de assalto as salas IMAX ao redor do planeta.</p>
        
        <h2>O Fim da Era da Tela Verde Absoluta</h2>
        <p>A tecnologia dos "Volumes" — gigantescas cúpulas circulares construídas com milhões de microLEDs capazes de renderizar planos de fundo fotorrealistas em tempo real — mudou a forma como os atores contracenam. Em vez de imaginar um horizonte alienígena diante de um pano verde, a luz e os reflexos dos cenários incidem fisicamente nos rostos, trajes e objetos de cena.</p>

        <h2>A Poética da Luz e das Lentes</h2>
        <p>Mesmo com câmeras digitais capazes de gravar em 8K com alcance dinâmico sem precedentes, cineastas renomados optam por acoplar lentes anamórficas vintage dos anos 1970 para introduzir aberrações ópticas encantadoras, flares elegantes e um toque humano insubstituível.</p>
      `,
      sources_json: JSON.stringify([
        { title: 'American Cinematographer Magazine', url: 'https://ascmag.com' }
      ]),
      tags: ['Cinema', 'Reviews']
    },
    {
      title: 'O Fenômeno das Séries de Alta Densidade: Por Que Histórias Complexas Dominam o Streaming',
      subtitle: 'Tramas com múltiplos pontos de vista e mundos ricos conquistam públicos cada vez mais atentos aos mínimos detalhes de produção.',
      slug: 'fenomeno-series-alta-densidade-complexidade-streaming',
      category_id: catMap['series'] || 4,
      cover_image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
      cover_caption: 'Ambiente de cinema em casa com exibição de produções épicas de streaming.',
      cover_source: 'Streaming News / Divulgação',
      featured: 0,
      reading_time: 5,
      views: 890,
      excerpt: 'Espectadores preferem temporadas com arcos bem amarrados a episódios puramente episódicos. Entenda os fatores por trás dessa virada narrativa.',
      content: `
        <p class="lead">Houve uma época em que a televisão aberta evitava tramas intrincadas por medo de perder o espectador que não assistiu ao episódio da semana anterior. No streaming sob demanda, esse paradigma ruiu por completo.</p>
        
        <h2>O Hábito de Debater Cada Detalhe na Comunidade</h2>
        <p>Hoje, cada frame de uma produção de destaque é esmiuçado por fãs em fóruns, redes sociais e vídeos de teoria. Essa participação ativa transforma o ato de assistir a uma série em uma experiência comunitária rica e vibrante.</p>

        <h2>Qualidade Técnica de Longa-Metragem na Telinha</h2>
        <p>Os orçamentos por episódio das séries de ponta rivalizam diretamente com os de blockbusters do cinema. Direção de arte primorosa, trilhas sonoras orquestrais e efeitos visuais meticulosos tornam o consumo doméstico uma verdadeira celebração audiovisual.</p>
      `,
      sources_json: JSON.stringify([
        { title: 'Variety Industry Insights', url: 'https://variety.com' }
      ]),
      tags: ['Streaming', 'Netflix']
    },
    {
      title: 'Inteligência Artificial Generativa e o Futuro dos Efeitos Visuais na Cultura Pop',
      subtitle: 'Ferramentas neurais estão acelerando tarefas de pós-produção e permitindo que criadores independentes realizem visões ambiciosas.',
      slug: 'inteligencia-artificial-futuro-efeitos-visuais-cultura-pop',
      category_id: catMap['cultura-geek-tecnologia'] || 5,
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      cover_caption: 'Arte conceitual abstrata representando sinapses neurais e tecnologia digital.',
      cover_source: 'Acervo Tech / Imagem Editorial',
      featured: 1,
      reading_time: 6,
      views: 1650,
      excerpt: 'Como algoritmos de ponta estão sendo integrados a fluxos de trabalho éticos na criação de jogos, animações e efeitos especiais.',
      content: `
        <p class="lead">A tecnologia avança a passos largos e o ecossistema criativo da cultura geek está no epicentro dessa transformação. O debate sobre automação e assistência inteligente nunca foi tão relevante.</p>
        
        <h2>Aceleração de Tarefas Repetitivas</h2>
        <p>Em estúdios de animação e jogos, modeladores e artistas de textura passam dias ajustando reflexos e rotoscopias frame a frame. Com ferramentas neurais integradas a softwares clássicos como Blender e Maya, essas etapas rotineiras passam a levar minutos, liberando tempo precioso para o refinamento artístico e a concepção de conceitos originais.</p>

        <h2>A Importância da Autoria Humana e Ética</h2>
        <p>No centro de qualquer obra memorável está a sensibilidade humana: a capacidade de emocionar, questionar a moral e contar histórias com verdade e empatia. A tecnologia permanece como um instrumento poderoso nas mãos de artistas talentosos.</p>
      `,
      sources_json: JSON.stringify([
        { title: 'MIT Technology Review', url: 'https://www.technologyreview.com' },
        { title: 'Ars Technica Science & Tech', url: 'https://arstechnica.com' }
      ]),
      tags: ['Inteligência Artificial', 'Hardware']
    }
  ];

  const insertArt = db.prepare(`
    INSERT INTO articles (
      title, subtitle, slug, content, excerpt, cover_image, cover_caption, cover_source,
      author_id, category_id, status, published_at, updated_at, reading_time, views, featured,
      meta_title, meta_description, canonical_url, sources_json, allow_comments
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?,
      ?, ?, ?, ?, 1
    )
  `);

  const insertArtTag = db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)');
  const tagList = db.prepare('SELECT id, name FROM tags').all() as Array<{ id: number; name: string }>;
  const tagMap = Object.fromEntries(tagList.map(t => [t.name, t.id]));

  for (const art of sampleArticles) {
    const res = insertArt.run(
      art.title,
      art.subtitle,
      art.slug,
      art.content,
      art.excerpt,
      art.cover_image,
      art.cover_caption,
      art.cover_source,
      admin.id,
      art.category_id,
      art.reading_time,
      art.views,
      art.featured,
      `${art.title} | BLOG FILIPEM2`,
      art.excerpt,
      `https://blogfilipem2.com.br/artigo/${art.slug}`,
      art.sources_json
    );

    const artId = Number(res.lastInsertRowid);
    for (const tagName of art.tags) {
      if (tagMap[tagName]) {
        insertArtTag.run(artId, tagMap[tagName]);
      }
    }
  }
}

function seedLegalPages(db: DatabaseSync) {
  const pages = [
    {
      title: 'Sobre Nós',
      slug: 'sobre',
      content: `
        <h1>Sobre o BLOG FILIPEM2</h1>
        <p class="lead">O <strong>BLOG FILIPEM2</strong> nasceu da paixão visceral por tecnologia, jogos eletrônicos, trilhas sonoras inesquecíveis, grandes produções cinematográficas e as tendências que movem a cultura geek global.</p>
        
        <h2>Nossa Missão Editorial</h2>
        <p>Existimos para fornecer aos nossos leitores análises aprofundadas, notícias verificadas com rapidez e seriedade, além de guias que realmente ajudam os entusiastas a desfrutar do melhor do entretenimento moderno.</p>
        <p>Acreditamos no jornalismo ético, na transparência sobre as fontes de informação e na valorização dos direitos autorais de todos os criadores.</p>

        <h2>Valores Fundamentais</h2>
        <ul>
          <li><strong>Autenticidade:</strong> Produzimos análises e críticas com opiniões genuínas, sem influências comerciais secretas.</li>
          <li><strong>Respeito ao Leitor:</strong> Design limpo, sem anúncios invasivos ou popups abusivos que interfiram na leitura.</li>
          <li><strong>Inovação Tecnológica:</strong> Um portal moderno, veloz, acessível e preparado para os padrões mais rigorosos da web contemporânea.</li>
          <li><strong>Privacidade:</strong> Cumprimento estrito da Lei Geral de Proteção de Dados (LGPD) e transparência total no tratamento de dados.</li>
        </ul>

        <h2>Contato Editorial</h2>
        <p>Dúvidas, sugestões de pauta ou parcerias comerciais podem ser enviadas diretamente por meio da nossa página oficial de <a href="/contato">Contato</a>.</p>
      `,
      meta_title: 'Sobre Nós | BLOG FILIPEM2',
      meta_description: 'Conheça a história, a missão editorial e os valores que tornam o BLOG FILIPEM2 referência em games, cinema, música e cultura pop.',
      is_system: 1
    },
    {
      title: 'Política de Privacidade',
      slug: 'privacidade',
      content: `
        <h1>Política de Privacidade — BLOG FILIPEM2</h1>
        <p class="lead">Esta Política de Privacidade descreve como o <strong>BLOG FILIPEM2</strong> coleta, utiliza, armazena e protege os dados pessoais de seus usuários, em total conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei Federal nº 13.709/2018)</strong> e demais legislações brasileiras aplicáveis.</p>
        
        <h2>1. Identificação do Controlador</h2>
        <p>O portal <strong>BLOG FILIPEM2</strong> é o controlador dos dados coletados durante sua navegação neste site. Para qualquer questão relacionada à privacidade, disponibilizamos o canal específico informado ao final deste documento.</p>

        <h2>2. Dados Pessoais Coletados</h2>
        <p>Coletamos apenas as informações estritamente necessárias para a operação, segurança e melhoria contínua do portal:</p>
        <ul>
          <li><strong>Dados fornecidos voluntariamente:</strong> Nome e endereço de e-mail ao enviar mensagens pelo formulário de contato, inscrever-se na newsletter ou publicar comentários autorizados nos artigos.</li>
          <li><strong>Dados de navegação técnica:</strong> Endereço IP (armazenado de forma anonimizada ou pseudonimizada para prevenção de abusos e segurança cibernética), tipo de navegador, sistema operacional e páginas acessadas.</li>
          <li><strong>Cookies e preferências:</strong> Registros sobre seu tema preferido (modo claro ou escuro) e seu consentimento quanto a cookies, armazenados localmente no seu dispositivo.</li>
        </ul>

        <h2>3. Finalidades do Tratamento de Dados</h2>
        <p>Tratamos seus dados com base nas seguintes hipóteses legais previstas no art. 7º da LGPD:</p>
        <ul>
          <li><strong>Consentimento:</strong> Para envio de novidades por e-mail e moderação de comentários com seu nome público.</li>
          <li><strong>Legítimo Interesse:</strong> Para análise agregada e estatística de audiência, identificação de erros técnicos e melhoria do desempenho das páginas.</li>
          <li><strong>Cumprimento de Obrigação Legal:</strong> Guarda de registros de acesso a aplicações de internet, em conformidade com o art. 15 do Marco Civil da Internet (Lei nº 12.965/2014).</li>
        </ul>

        <h2>4. Compartilhamento de Dados</h2>
        <p><strong>Não vendemos, não alugamos e não comercializamos dados pessoais com terceiros.</strong> O compartilhamento pode ocorrer unicamente com provedores de infraestrutura de hospedagem e segurança que operem sob rigorosos contratos de sigilo e conformidade com a LGPD, ou mediante ordem judicial emanada por autoridade competente.</p>

        <h2>5. Direitos do Titular de Dados</h2>
        <p>Conforme previsto no art. 18 da LGPD, você possui o direito de solicitar a qualquer momento:</p>
        <ul>
          <li>Confirmação da existência de tratamento e acesso aos seus dados pessoais.</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.</li>
          <li>Revogação do consentimento concedido anteriormente.</li>
        </ul>

        <h2>6. Segurança da Informação</h2>
        <p>Adotamos medidas técnicas e administrativas aptas a proteger seus dados contra acessos não autorizados, destruição, perda ou alteração acidental, incluindo criptografia em trânsito (HTTPS/TLS), hashing criptográfico forte e restrição rigorosa de acessos administrativos.</p>

        <h2>7. Canal de Contato do Encarregado (DPO)</h2>
        <p>Para exercer qualquer um de seus direitos ou esclarecer dúvidas sobre esta política, utilize nosso formulário na página de <a href="/contato">Contato</a> selecionando o assunto "Privacidade e Proteção de Dados (LGPD)".</p>
        <p><em>Última atualização: Outubro de 2026.</em></p>
      `,
      meta_title: 'Política de Privacidade | BLOG FILIPEM2',
      meta_description: 'Saiba como o BLOG FILIPEM2 protege sua privacidade e trata seus dados com total conformidade com a LGPD (Lei nº 13.709/2018).',
      is_system: 1
    },
    {
      title: 'Política de Cookies',
      slug: 'cookies',
      content: `
        <h1>Política de Cookies — BLOG FILIPEM2</h1>
        <p class="lead">Esta política esclarece o que são cookies, como os utilizamos no <strong>BLOG FILIPEM2</strong> e como você tem total liberdade para aceitar, rejeitar ou gerenciar suas preferências a qualquer momento.</p>
        
        <h2>1. O Que São Cookies?</h2>
        <p>Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita uma página da web. Eles servem para lembrar suas preferências, garantir a segurança do acesso e compreender de forma agregada como o site é utilizado.</p>

        <h2>2. Tipos de Cookies Utilizados</h2>
        <ul>
          <li><strong>Cookies Estritamente Necessários:</strong> Fundamentais para o funcionamento básico do site, como autenticação segura do painel administrativo, prevenção contra ataques CSRF e memorização da sua escolha sobre os próprios cookies. Não podem ser desativados sem comprometer a navegação.</li>
          <li><strong>Cookies de Preferências:</strong> Lembram opções estéticas selecionadas por você, como a alternância entre o Modo Escuro e o Modo Claro.</li>
          <li><strong>Cookies de Desempenho e Estatísticas:</strong> Auxiliam a identificar quais artigos são mais lidos e se alguma página apresenta lentidão, sempre de forma anônima e agregada.</li>
        </ul>

        <h2>3. Como Gerenciar Seus Cookies</h2>
        <p>Ao acessar nosso site pela primeira vez, nosso banner de consentimento permite a você escolher entre aceitar todos os cookies, manter apenas os estritamente essenciais ou configurar detalhadamente suas preferências. Você também pode limpar ou bloquear cookies diretamente nas configurações do seu navegador de internet a qualquer momento.</p>
      `,
      meta_title: 'Política de Cookies | BLOG FILIPEM2',
      meta_description: 'Informações claras sobre o uso de cookies no BLOG FILIPEM2 e opções para gerenciar suas preferências de navegação.',
      is_system: 1
    },
    {
      title: 'Termos de Uso',
      slug: 'termos',
      content: `
        <h1>Termos de Uso — BLOG FILIPEM2</h1>
        <p class="lead">Bem-vindo ao <strong>BLOG FILIPEM2</strong>. Ao acessar e navegar em nossas páginas, você declara estar de acordo com os presentes Termos de Uso.</p>
        
        <h2>1. Uso Autorizado do Conteúdo</h2>
        <p>Todo o conteúdo textual, visual, logotipos e marcas do BLOG FILIPEM2 são protegidos pelas leis brasileiras de direitos autorais e propriedade intelectual. É permitida a citação de trechos curtos dos nossos artigos, desde que acompanhada de crédito explícito com link direto para o artigo original em nosso portal. É expressamente proibida a cópia integral ou reprodução não autorizada com finalidade comercial.</p>

        <h2>2. Conduta do Usuário e Comentários</h2>
        <p>Ao interagir com nosso portal, seja por meio de comentários ou formulários, você se compromete a:</p>
        <ul>
          <li>Não enviar conteúdo ilícito, difamatório, ofensivo, preconceituoso ou que incite violência.</li>
          <li>Não publicar mensagens publicitárias não autorizadas (spam) ou links maliciosos.</li>
          <li>Respeitar a opinião dos demais leitores e membros da comunidade.</li>
        </ul>
        <p>A equipe editorial reserva-se o direito soberano de moderar, editar ou remover comentários que desrespeitem estas diretrizes.</p>

        <h2>3. Isenção de Responsabilidade</h2>
        <p>Nos empenhamos para manter as informações rigorosamente atualizadas e precisas. Contudo, em virtude da volatilidade de lançamentos e novidades da indústria tecnológica e do entretenimento, não nos responsabilizamos por perdas diretas ou indiretas decorrentes de decisões tomadas com base nas opiniões ou notícias veiculadas.</p>
      `,
      meta_title: 'Termos de Uso | BLOG FILIPEM2',
      meta_description: 'Regras de utilização, condições de acesso e diretrizes para navegação no portal BLOG FILIPEM2.',
      is_system: 1
    },
    {
      title: 'Direitos Autorais e Propriedade Intelectual',
      slug: 'direitos-autorais',
      content: `
        <h1>Política de Direitos Autorais e Propriedade Intelectual</h1>
        <p class="lead">O <strong>BLOG FILIPEM2</strong> respeita integralmente os direitos de propriedade intelectual de criadores, estúdios, gravadoras, produtoras e desenvolvedores.</p>
        
        <h2>1. Conteúdo Original e Citação Justa</h2>
        <p>Nossos artigos, análises, críticas e guias são redigidos originalmente por nossa equipe. O uso de imagens de divulgação, pôsteres oficiais, trailers públicos e marcas comerciais ocorre estritamente sob as regras de <em>Fair Use</em> (uso justo) e do art. 46 da Lei de Direitos Autorais Brasileira (Lei nº 9.610/1998), com a exclusiva finalidade de crítica, notícia, estudo e divulgação cultural.</p>

        <h2>2. Procedimento de Notificação e Retirada (Takedown)</h2>
        <p>Caso você seja o detentor legítimo dos direitos autorais de qualquer material exibido no portal e acredite que seu trabalho foi utilizado de maneira indevida, envie uma solicitação formal contendo:</p>
        <ul>
          <li>Identificação clara da obra protegida por direitos autorais.</li>
          <li>Link exato da página onde o material está publicado em nosso portal.</li>
          <li>Comprovação de titularidade ou procuração para agir em nome do titular.</li>
          <li>Informações completas para contato (nome, telefone e e-mail).</li>
        </ul>
        <p>Nossa equipe jurídica e editorial analisará a notificação com máxima prioridade para rápida resolução ou remoção do material impugnado. Envie a notificação por meio de nossa página de <a href="/contato">Contato</a>.</p>
      `,
      meta_title: 'Direitos Autorais e Propriedade Intelectual | BLOG FILIPEM2',
      meta_description: 'Diretrizes de direitos autorais, uso justo de materiais de divulgação e procedimento formal para notificação e retirada de conteúdos.',
      is_system: 1
    },
    {
      title: 'Contato',
      slug: 'contato',
      content: `
        <h1>Fale Conosco — BLOG FILIPEM2</h1>
        <p class="lead">Tem alguma sugestão de pauta, crítica, proposta de parceria ou dúvida sobre o portal? Nossa equipe está à disposição para ouvir você.</p>
        <p>Utilize o formulário interativo abaixo para enviar sua mensagem diretamente à nossa redação. Respondemos com a máxima celeridade possível nos dias úteis.</p>
      `,
      meta_title: 'Contato | BLOG FILIPEM2',
      meta_description: 'Envie sugestões de pauta, propostas comerciais ou tire dúvidas diretamente com a redação do BLOG FILIPEM2.',
      is_system: 1
    },
    {
      title: 'Política de Correções e Atualizações',
      slug: 'correcoes',
      content: `
        <h1>Política de Correções e Atualizações Editoriais</h1>
        <p class="lead">A precisão e a confiança de nossa comunidade são os bens mais preciosos do <strong>BLOG FILIPEM2</strong>.</p>
        
        <h2>1. Compromisso com a Verdade</h2>
        <p>Buscamos checar todas as informações antes de colocá-las no ar. No entanto, notícias de última hora ou análises técnicas podem exigir ajustes conforme novos fatos são confirmados.</p>

        <h2>2. Transparência nas Retificações</h2>
        <p>Sempre que um erro substancial de fato for corrigido em um artigo, incluiremos uma nota explícita ao final da publicação com o carimbo <strong>"Nota de Correção / Atualização"</strong>, especificando o que foi alterado e o respectivo horário, mantendo a integridade histórica da reportagem.</p>

        <h2>3. Canal para Apontamento de Erros</h2>
        <p>Se você identificou algum dado impreciso em qualquer uma de nossas publicações, por favor nos avise via <a href="/contato">Contato</a> com o assunto "Correção Editorial". Agradecemos sua colaboração!</p>
      `,
      meta_title: 'Política de Correções | BLOG FILIPEM2',
      meta_description: 'Nosso compromisso inegociável com a precisão dos fatos, transparência editorial e retificação rápida de dados no BLOG FILIPEM2.',
      is_system: 1
    },
    {
      title: 'Publicidade, Patrocínios e Afiliados',
      slug: 'publicidade',
      content: `
        <h1>Informações sobre Publicidade e Afiliados</h1>
        <p class="lead">O <strong>BLOG FILIPEM2</strong> mantém total independência editorial em relação a anunciantes e patrocinadores.</p>
        
        <h2>1. Identificação de Conteúdo Patrocinado</h2>
        <p>Qualquer artigo, vídeo ou análise que tenha sido patrocinado por uma marca conterá rotulagem explícita e inequívoca de <strong>"Conteúdo Patrocinado"</strong> ou <strong>"Publieditorial"</strong> logo no início da matéria.</p>

        <h2>2. Links Afiliados</h2>
        <p>Eventualmente, ao indicar jogos, livros, periféricos ou eletrônicos, podemos incluir links de programas de afiliados (como Amazon ou lojas de games confiáveis). Caso o leitor decida adquirir um produto por meio desses links, poderemos receber uma pequena comissão sem qualquer custo adicional para você. Recomendamos apenas produtos em que realmente acreditamos.</p>

        <h2>3. Anúncios Display</h2>
        <p>Espaços publicitários são demarcados visualmente para não se confundirem com o conteúdo editorial legítimo, prezando sempre por um carregamento veloz e uma leitura agradável.</p>
      `,
      meta_title: 'Publicidade e Afiliados | BLOG FILIPEM2',
      meta_description: 'Diretrizes sobre monetização transparente, rotulagem de publieditoriais e uso de links afiliados no BLOG FILIPEM2.',
      is_system: 1
    }
  ];

  const insertPage = db.prepare(`
    INSERT INTO pages (title, slug, content, meta_title, meta_description, is_system)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const p of pages) {
    insertPage.run(p.title, p.slug, p.content, p.meta_title, p.meta_description, p.is_system);
  }
}

function seedSettings(db: DatabaseSync) {
  const defaultSettings: Record<string, string> = {
    site_title: 'BLOG FILIPEM2',
    site_tagline: 'O Portal Definitivo de Games, Músicas, Filmes, Séries e Cultura Geek',
    site_description: 'Notícias diárias, análises aprofundadas, lançamentos e críticas sobre jogos, cinema, música, streaming e inovações tecnológicas.',
    site_url: 'https://blogfilipem2.com.br',
    theme_primary_color: '#DC2626',
    theme_font_heading: 'Space Grotesk',
    theme_font_body: 'Inter',
    theme_border_radius: '0.75rem',
    header_menu_json: JSON.stringify([
      { title: 'Início', url: '/' },
      { title: 'Games', url: '/categoria/games' },
      { title: 'Músicas', url: '/categoria/musicas' },
      { title: 'Filmes', url: '/categoria/filmes' },
      { title: 'Séries', url: '/categoria/series' },
      { title: 'Geek & Tech', url: '/categoria/cultura-geek-tecnologia' },
      { title: 'Sobre', url: '/sobre' },
      { title: 'Contato', url: '/contato' }
    ]),
    footer_text: '© 2026 BLOG FILIPEM2. Todos os direitos reservados. Portal independente de cultura geek e entretenimento.',
    social_links_json: JSON.stringify({
      youtube: 'https://youtube.com',
      twitter: 'https://x.com',
      instagram: 'https://instagram.com',
      discord: 'https://discord.com',
      twitch: 'https://twitch.tv',
      tiktok: 'https://tiktok.com'
    }),
    cookie_consent_enabled: '1',
    cookie_banner_text: 'Utilizamos cookies essenciais e tecnologias de medição anônima para garantir a melhor experiência no BLOG FILIPEM2, em conformidade com a LGPD.',
    ad_header_enabled: '0',
    ad_header_code: '',
    ad_sidebar_enabled: '1',
    ad_sidebar_code: '<div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">Espaço Publicitário Disponível (300x250)</div>',
    ad_article_enabled: '1',
    ad_article_code: '<div class="my-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">Publicidade / Espaço Reservado para Anúncios</div>',
    ad_footer_enabled: '0',
    ad_footer_code: '',
    robots_txt_content: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://blogfilipem2.com.br/sitemap.xml`,
    google_analytics_id: '',
    google_search_console_tag: ''
  };

  const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaultSettings)) {
    insertSetting.run(k, v);
  }
}

function seedBuilderSections(db: DatabaseSync) {
  const sections = [
    {
      page: 'home',
      type: 'hero_featured',
      title: 'Grandes Destaques',
      subtitle: 'As matérias e análises mais quentes do momento',
      config: JSON.stringify({
        layout: 'hero_with_side_stack',
        limit: 3,
        showBadge: true,
        showExcerpt: true,
        showReadingTime: true
      }),
      sort: 1
    },
    {
      page: 'home',
      type: 'breaking_ticker',
      title: 'Em Alta Agora',
      subtitle: '',
      config: JSON.stringify({
        badgeText: 'URGENTE',
        limit: 5,
        speed: 'normal'
      }),
      sort: 2
    },
    {
      page: 'home',
      type: 'category_grid',
      title: 'Universo dos Games',
      subtitle: 'Lançamentos, análises técnicas e novidades para PC e Consoles',
      config: JSON.stringify({
        categorySlug: 'games',
        limit: 3,
        columns: 3,
        cardStyle: 'card_with_hover'
      }),
      sort: 3
    },
    {
      page: 'home',
      type: 'video_showcase',
      title: 'Trailers & Vídeos em Destaque',
      subtitle: 'Confira as últimas prévias oficiais direto dos estúdios',
      config: JSON.stringify({
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoTitle: 'Novo Trailer Épico Revelado',
        videoDescription: 'Acompanhe as revelações mais impactantes da temporada em alta definição.'
      }),
      sort: 4
    },
    {
      page: 'home',
      type: 'category_grid',
      title: 'Cinema & Séries',
      subtitle: 'Tudo sobre as telas de cinema e as maratonas do streaming',
      config: JSON.stringify({
        categorySlug: 'filmes',
        limit: 3,
        columns: 3,
        cardStyle: 'card_with_hover'
      }),
      sort: 5
    },
    {
      page: 'home',
      type: 'category_grid',
      title: 'Músicas, Cultura Geek & Tecnologia',
      subtitle: 'Tendências sonoras, inteligência artificial e cultura pop',
      config: JSON.stringify({
        categorySlug: 'cultura-geek-tecnologia',
        limit: 3,
        columns: 3,
        cardStyle: 'card_with_hover'
      }),
      sort: 6
    },
    {
      page: 'home',
      type: 'newsletter',
      title: 'Receba o Melhor da Cultura Geek',
      subtitle: 'Sem spam, apenas as análises e notícias mais relevantes selecionadas pela nossa redação.',
      config: JSON.stringify({
        buttonText: 'Cadastrar Gratuitamente',
        placeholder: 'Seu melhor e-mail...',
        accentColor: '#DC2626'
      }),
      sort: 7
    }
  ];

  const insertSection = db.prepare(`
    INSERT INTO visual_builder_sections (page_identifier, type, title, subtitle, config_json, sort_order, is_active, version_state)
    VALUES (?, ?, ?, ?, ?, ?, 1, 'published')
  `);

  for (const s of sections) {
    insertSection.run(s.page, s.type, s.title, s.subtitle, s.config, s.sort);
  }
}
