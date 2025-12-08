/**
 * Modelo de Escola
 *
 * Este modelo é um discriminador do modelo de Usuário principal.
 * Usamos discriminadores para manter todos os usuários (Admin, Escola, Aluno)
 * na mesma coleção 'users', mas com campos específicos para cada tipo.
 */
import { Escola } from "./User";

export { Escola };
export default Escola;
