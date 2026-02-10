## [Unreleased]

  

### Added

- **app.ts**: Separação da configuração do Express (rotas, CORS, middlewares) do ponto de entrada; `server.ts` apenas carrega env, conecta ao MongoDB e sobe o app.

- **Helmet**: Middleware de segurança HTTP (headers) adicionado em `app.ts` e dependência no `package.json`.

- **Product (create/update)**: Validação Zod alinhada ao schema do Mongoose: `constraints` (min/max height, width, depth), `components` (material, quantityType, quantityFactor), `baseLaborCost`, `profitMargin`; removido uso de `price` (preço é calculado por dimensões no pricing_service).

- **Quote**: Validação de dimensões (height, width, depth) com Zod; erros repassados ao middleware global via `next(err)`.

  

### Changed

- **Tratamento de erros**: Classe renomeada de `appError` para `app_error_class`; parâmetro do construtor de `statusCode` para `status_code` (internamente atribuído a `this.statusCode`). Uso consistente em todos os controllers e no `auth_middleware`.

- **auth_controller**: Login e `update_password` passam a usar `app_error_class` e `next(err)` em vez de `res.status().json()` direto; resposta de erro unificada com o restante da API.

- **material_controller**: Todos os handlers passam a usar `next(err)` e `app_error_class` para erros de negócio (404, 400); erros inesperados repassados ao middleware global. Ordem das funções alterada (get_all antes de get_by_id, create após).

- **product_controller**: Create e update validam e persistem `constraints`, `components`, `baseLaborCost`, `profitMargin`; erros de validação e de negócio via `app_error_class` e `next(err)`.

- **auth_middleware**: Respostas 401 passam a usar `app_error_class` + `next()` em vez de `res.status(401).json()`.

- **error_handling_middleware**: Mensagens ajustadas ("Registro duplicado no banco de dados", "Erro interno do servidor").

- **Rotas**: Renomeação de `router` para `products_router` em `product_routes.ts` e para `material_router` em `material_routes.ts` (consistência com o nome do arquivo e com `auth_router` em `app.ts`).

- **server.ts**: Reduzido a carregar dotenv, validar `DATABASE_URL`, conectar ao MongoDB e dar `app.listen`; toda a montagem do app movida para `app.ts`.

  

### Fixed

- **material_controller**: Removido import desnecessário e circular de `app` (evita dependência circular app ? routes ? controller ? app).

- **Product schema vs controller**: Create/update deixam de gravar campo inexistente `price` e passam a usar os campos reais do model (`constraints`, `components`, `baseLaborCost`, `profitMargin`).

  

### Technical

- Controllers passam a receber e usar `NextFunction` onde faltava, repassando erros ao middleware global.

- Respostas de erro padronizadas no formato `{ success: false, message: string }` pelo `error_handling_middleware`.