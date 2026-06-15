import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

const SENSIVEIS = ['senha', 'password', 'token', 'senhaHash', 'cscToken', 'certificadoRef'];

function sanitizar(body: unknown): unknown {
  if (!body || typeof body !== 'object') return undefined;
  const copia: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const k of Object.keys(copia)) if (SENSIVEIS.includes(k)) copia[k] = '***';
  return copia;
}

// caminho -> (entidade, ação amigável). Primeira regra que casar.
const REGRAS: { re: RegExp; entidade: string; acao?: string }[] = [
  { re: /\/auth\/registrar/, entidade: 'Conta', acao: 'Criou conta' },
  { re: /\/auth\/login/, entidade: 'Sessão', acao: 'Entrou' },
  { re: /\/caixa\/abrir/, entidade: 'Caixa', acao: 'Abriu' },
  { re: /\/caixa\/fechar/, entidade: 'Caixa', acao: 'Fechou' },
  { re: /\/caixa\/lancamentos/, entidade: 'Caixa', acao: 'Lançou' },
  { re: /\/vendas/, entidade: 'Venda', acao: 'Registrou' },
  { re: /\/estoque\/entradas/, entidade: 'Estoque', acao: 'Deu entrada' },
  { re: /\/estoque\/fornecedores/, entidade: 'Fornecedor' },
  { re: /\/clientes\/config/, entidade: 'Config crediário', acao: 'Alterou' },
  { re: /\/clientes/, entidade: 'Cliente' },
  { re: /\/catalogo\/produtos/, entidade: 'Produto' },
  { re: /\/catalogo\/categorias/, entidade: 'Categoria' },
  { re: /\/catalogo\/marcas/, entidade: 'Marca' },
  { re: /\/catalogo\/colecoes/, entidade: 'Coleção' },
  { re: /\/catalogo\/departamentos/, entidade: 'Departamento' },
  { re: /\/catalogo\/cores/, entidade: 'Cor' },
  { re: /\/catalogo\/grades/, entidade: 'Grade de tamanho' },
];

function acaoPadrao(metodo: string): string {
  if (metodo === 'POST') return 'Criou';
  if (metodo === 'DELETE') return 'Removeu';
  return 'Alterou';
}

/** Grava na trilha de auditoria toda requisição de escrita (POST/PUT/PATCH/DELETE). */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next.handle();
    return next.handle().pipe(tap((resposta) => void this.registrar(req, resposta)));
  }

  private async registrar(req: any, resposta: any): Promise<void> {
    try {
      const caminho: string = (req.originalUrl ?? req.url ?? '').split('?')[0];
      const tenantId: string | undefined = req.user?.tenantId ?? resposta?.tenantId;
      if (!tenantId) return;

      const regra = REGRAS.find((r) => r.re.test(caminho));
      const entidade = regra?.entidade ?? 'Sistema';
      const acao = regra?.acao ?? acaoPadrao(req.method);
      const entidadeId: string | null = resposta?.id ?? req.params?.id ?? null;

      await this.prisma.auditLog.create({
        data: {
          tenantId,
          usuarioId: req.user?.userId ?? resposta?.usuario?.id ?? null,
          metodo: req.method,
          caminho,
          entidade,
          acao,
          entidadeId,
          resumo: `${acao} ${entidade}`.trim(),
          payload: sanitizar(req.body) as any,
        },
      });
    } catch {
      // auditoria nunca pode quebrar a requisição
    }
  }
}
