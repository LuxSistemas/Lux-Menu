-- "ativo" (rodízio de sábado) e "aparecer na Agenda" eram a mesma coluna — tirar alguém
-- do plantão também tirava ele da Agenda, o que não é a intenção. Agora são independentes.
ALTER TABLE pessoas_escala ADD COLUMN ativo_agenda INTEGER NOT NULL DEFAULT 1;
