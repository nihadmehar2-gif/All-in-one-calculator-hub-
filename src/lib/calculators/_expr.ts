/**
 * EveryCalc — Safe Math Expression Parser
 * =======================================
 *
 * A small recursive-descent parser for arithmetic expressions, used by the
 * scientific calculator, the numerical derivative, and the definite integral.
 *
 * No use of `eval` or `new Function` — the parser walks a hand-rolled grammar
 * so arbitrary JavaScript cannot run. The only side effect is arithmetic.
 *
 * Supported grammar:
 *   expr   := term (('+' | '-') term)*
 *   term   := factor (('*' | '/' | '%') factor)*
 *   factor := unary ('^' factor)?            // ^ is right-associative
 *   unary  := ('+' | '-') unary | primary
 *   primary:= number | const | func '(' args ')' | '(' expr ')' | var
 *
 * Functions:  sin cos tan asin acos atan sinh cosh tanh
 *             log (base 10) ln (base e) log2 log(base, x)
 *             sqrt cbrt abs exp floor ceil round sign fact
 * Constants:  pi e tau phi
 * Variables:  a single identifier named by `variables` keys (default: x)
 *
 * Angle mode applies to trig functions and their inverses:
 *   deg   sin/cos/tan take degrees, asin/acos/atan return degrees
 *   rad   everything in radians (default)
 */

export interface EvalOptions {
  /** Trig angle mode. Default "rad". */
  angleMode?: "rad" | "deg";
  /** Variable bindings, e.g. { x: 2 }. Identifiers not in this map are errors. */
  variables?: Record<string, number>;
}

class Tokenizer {
  readonly tokens: { type: string; value: string }[] = [];
  private i = 0;
  constructor(private src: string) {
    while (this.i < src.length) this.next();
  }
  private next(): void {
    const src = this.src;
    const c = src[this.i];
    if (/\s/.test(c)) { this.i++; return; }
    if (/[0-9.]/.test(c)) {
      let j = this.i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      // exponent: 1e3, 1.5E-2
      if (src[j] === "e" || src[j] === "E") {
        const k = j + 1;
        if (src[k] === "+" || src[k] === "-") j = k + 1;
        else if (/[0-9]/.test(src[k] ?? "")) j = k;
        while (j < src.length && /[0-9]/.test(src[j])) j++;
      }
      this.tokens.push({ type: "num", value: src.slice(this.i, j) });
      this.i = j;
      return;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = this.i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      this.tokens.push({ type: "ident", value: src.slice(this.i, j) });
      this.i = j;
      return;
    }
    // multi-char operators
    const two = src.slice(this.i, this.i + 2);
    if (two === "**") { this.tokens.push({ type: "op", value: "^" }); this.i += 2; return; }
    if ("+-*/%^(),<>".includes(c)) {
      this.tokens.push({ type: "op", value: c });
      this.i++;
      return;
    }
    throw new Error(`Unexpected character '${c}' at position ${this.i}`);
  }
}

class Parser {
  private pos = 0;
  constructor(private tokens: { type: string; value: string }[], private opts: EvalOptions) {}

  private peek(): { type: string; value: string } | undefined {
    return this.tokens[this.pos];
  }
  private eat(): { type: string; value: string } {
    const t = this.tokens[this.pos];
    if (!t) throw new Error("Unexpected end of expression");
    this.pos++;
    return t;
  }
  private expect(value: string): void {
    const t = this.eat();
    if (t.value !== value) throw new Error(`Expected '${value}', got '${t.value}'`);
  }

  parse(): number {
    const v = this.parseExpr();
    if (this.pos !== this.tokens.length) {
      throw new Error(`Unexpected token '${this.tokens[this.pos]?.value}'`);
    }
    return v;
  }

  private parseExpr(): number {
    let left = this.parseTerm();
    while (this.peek()?.value === "+" || this.peek()?.value === "-") {
      const op = this.eat().value;
      const right = this.parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  private parseTerm(): number {
    let left = this.parseFactor();
    while (this.peek()?.value === "*" || this.peek()?.value === "/" || this.peek()?.value === "%") {
      const op = this.eat().value;
      const right = this.parseFactor();
      if (op === "*") left = left * right;
      else if (op === "/") {
        if (right === 0) throw new Error("Division by zero");
        left = left / right;
      } else {
        if (right === 0) throw new Error("Modulo by zero");
        left = left % right;
      }
    }
    return left;
  }

  private parseFactor(): number {
    const base = this.parseUnary();
    if (this.peek()?.value === "^") {
      this.eat();
      const exp = this.parseFactor(); // right-associative
      return Math.pow(base, exp);
    }
    return base;
  }

  private parseUnary(): number {
    const t = this.peek();
    if (t?.value === "+") { this.eat(); return this.parseUnary(); }
    if (t?.value === "-") { this.eat(); return -this.parseUnary(); }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const t = this.eat();
    if (t.type === "num") {
      const n = Number(t.value);
      if (!Number.isFinite(n)) throw new Error(`Invalid number '${t.value}'`);
      return n;
    }
    if (t.value === "(") {
      const v = this.parseExpr();
      this.expect(")");
      return v;
    }
    if (t.type === "ident") {
      const name = t.value.toLowerCase();
      // function call?
      if (this.peek()?.value === "(") {
        this.eat(); // (
        const args: number[] = [];
        if (this.peek()?.value !== ")") {
          args.push(this.parseExpr());
          while (this.peek()?.value === ",") {
            this.eat();
            args.push(this.parseExpr());
          }
        }
        this.expect(")");
        return this.applyFunction(name, args);
      }
      // constant
      const consts: Record<string, number> = { pi: Math.PI, e: Math.E, tau: Math.PI * 2, phi: (1 + Math.sqrt(5)) / 2 };
      if (name in consts) return consts[name];
      // variable
      const vars = this.opts.variables ?? {};
      if (name in vars) return vars[name]!;
      throw new Error(`Unknown identifier '${t.value}'`);
    }
    throw new Error(`Unexpected token '${t.value}'`);
  }

  private applyFunction(name: string, args: number[]): number {
    const deg = this.opts.angleMode === "deg";
    const toRad = (x: number) => (deg ? (x * Math.PI) / 180 : x);
    const fromRad = (x: number) => (deg ? (x * 180) / Math.PI : x);
    const unary = (f: (x: number) => number): number => {
      if (args.length !== 1) throw new Error(`${name}() expects 1 argument`);
      return f(args[0]);
    };
    switch (name) {
      case "sin": return unary((x) => Math.sin(toRad(x)));
      case "cos": return unary((x) => Math.cos(toRad(x)));
      case "tan": return unary((x) => Math.tan(toRad(x)));
      case "asin": return unary((x) => fromRad(Math.asin(x)));
      case "acos": return unary((x) => fromRad(Math.acos(x)));
      case "atan": return unary((x) => fromRad(Math.atan(x)));
      case "sinh": return unary(Math.sinh);
      case "cosh": return unary(Math.cosh);
      case "tanh": return unary(Math.tanh);
      case "log": {
        // log(base, x) or log(x) (base 10)
        if (args.length === 2) {
          const [base, x] = args;
          if (base <= 0 || base === 1 || x <= 0) throw new Error("Invalid log arguments");
          return Math.log(x) / Math.log(base);
        }
        return unary((x) => {
          if (x <= 0) throw new Error("log() requires positive input");
          return Math.log10(x);
        });
      }
      case "ln": return unary((x) => {
        if (x <= 0) throw new Error("ln() requires positive input");
        return Math.log(x);
      });
      case "log2": return unary((x) => {
        if (x <= 0) throw new Error("log2() requires positive input");
        return Math.log2(x);
      });
      case "sqrt": return unary((x) => {
        if (x < 0) throw new Error("sqrt() requires non-negative input");
        return Math.sqrt(x);
      });
      case "cbrt": return unary(Math.cbrt);
      case "abs": return unary(Math.abs);
      case "exp": return unary(Math.exp);
      case "floor": return unary(Math.floor);
      case "ceil": return unary(Math.ceil);
      case "round": return unary(Math.round);
      case "sign": return unary(Math.sign);
      case "fact": return unary((x) => {
        if (x < 0 || !Number.isInteger(x)) throw new Error("fact() requires a non-negative integer");
        let r = 1;
        for (let i = 2; i <= x; i++) r *= i;
        return r;
      });
      default:
        throw new Error(`Unknown function '${name}'`);
    }
  }
}

export function evaluateExpression(src: string, opts: EvalOptions = {}): number {
  if (!src || !src.trim()) throw new Error("Empty expression");
  const tokens = new Tokenizer(src).tokens;
  if (tokens.length === 0) throw new Error("Empty expression");
  const parser = new Parser(tokens, opts);
  const result = parser.parse();
  if (!Number.isFinite(result)) throw new Error("Result is not finite (overflow or div-by-zero)");
  return result;
}
