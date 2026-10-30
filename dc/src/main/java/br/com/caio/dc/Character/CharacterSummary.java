package br.com.caio.dc.Character;

/**
 * Versão leve do personagem para listagens: só as colunas que a tela usa.
 * Não carrega aparições nem jogos, então não dispara consultas extras.
 */
public record CharacterSummary(String id, String name, String background) {
}
