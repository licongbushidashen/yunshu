/* https://github.com/handsontable/formula-parser/blob/develop/src/grammar-parser/grammar-parser.jison */
/* http://zaa.ch/jison/try/ */
/* http://zaa.ch/jison/docs/ */
/* description: Parses end evaluates mathematical expressions. */
/* lexical grammar */
/* '['(.*)?']'                                                                                  {return 'ARRAY';} */
%lex
%%
\s+                                                                                             {/* skip whitespace */}
'"'("\\"["]|[^"])*'"'                                                                           {return 'STRING';}
/* "'"('\\'[']|[^'])*"'"                                                                           {return 'STRING';} */
[0-9]+                                                                                          {return 'NUMBER';}
[.]                                                                                             {return 'DECIMAL';}
[a|A]{1}[n|N]{1}[d|D]{1}                                                                        {return 'AND';}
[o|O]{1}[r|R]{1}                                                                                {return 'OR';}
/* [s|S]{1}[u|U]{1}[m|M]{1}[i|I]{1}[f|F]{1}[s|S]{1}[\s]*[(][^)]*(?=[)])[)]                         {return 'SUMIFS';} */
" "                                                                                             {return ' ';}
","                                                                                             {return ',';}
'"'                                                                                             {return '"';}
/* ^(?:(?!([a|A]{1}[n|N]{1}[d|D]{1})$)(?!([o|O]{1}[r|R]{1})$)[A-Za-z]+) */
[A-Za-z]+[\s]*(?=[(])                                                                           {return 'FUNCTION';}
[{][A-Za-z0-9\.]+[}]                                                                            {return 'FIELD';}
[A-Za-z]+                                                                                       {return 'KEYWORD';}
/* "'"                                                                                             {return "'";} */
"*"                                                                                             {return '*';}
"/"                                                                                             {return '/';}
"-"                                                                                             {return '-';}
"+"                                                                                             {return '+';}
"("                                                                                             {return '(';}
")"                                                                                             {return ')';}
"{"                                                                                             {return '{';}
"}"                                                                                             {return '}';}
"<>"                                                                                             {return '<>';}
">="                                                                                             {return '>=';}
"<="                                                                                             {return '<=';}
">"                                                                                             {return '>';}
"<"                                                                                             {return '<';}
"="                                                                                             {return '=';}
<<EOF>>                                                                                         {return 'EOF';}
/* .                                                                                               {return 'INVALID';} */
/lex

/* operator associations and precedence (low-top, high-bottom) */
/* %left '='  %left '==' '<>'*/
%left 'AND' 'OR'
%left '=' '<>'
%left '<=' '>=' '>' '<'
%left '+' '-'
%left '*' '/'
%left UMINUS UPLUS

%start expressions

%% /* language grammar */

expressions
  : expression EOF {
      return $1;
    }
;

expression
  : FIELD {
      $$ = yy.callField($1);
    }
  | number {
      $$ = yy.callNumber($1);
    }
  | STRING {
      $$ = yy.callString($1);
    }
  | KEYWORD {
      $$ = yy.callKeyword($1);
    }
  | '(' expression ')' {
      $$ = $2;
    }
  | expression '=' expression {
      $$ = yy.evaluateByOperator('=', [$1, $3]);
    }
  | expression '<>' expression {
      $$ = yy.evaluateByOperator('<>', [$1, $3]);
    }
  | expression '<=' expression {
      $$ = yy.evaluateByOperator('<=', [$1, $3]);
    }
  | expression '>=' expression {
      $$ = yy.evaluateByOperator('>=', [$1, $3]);
    }
  | expression '<' expression {
      $$ = yy.evaluateByOperator('<', [$1, $3]);
    }
  | expression '>' expression {
      $$ = yy.evaluateByOperator('>', [$1, $3]);
    }
  | expression '+' expression {
      $$ = yy.evaluateByOperator('+', [$1, $3]);
    }
  | expression '-' expression {
      $$ = yy.evaluateByOperator('-', [$1, $3]);
    }
  | expression '*' expression {
      $$ = yy.evaluateByOperator('*', [$1, $3]);
    }
  | expression '/' expression {
      $$ = yy.evaluateByOperator('/', [$1, $3]);
    }
  | expression 'AND' expression {
      $$ = yy.evaluateByOperator('AND', [$1, $3]);
    }
  | expression 'OR' expression {
      $$ = yy.evaluateByOperator('OR', [$1, $3]);
    }
  | '-' expression %prec UMINUS {
      $$ = yy.uminus($2);
    }
  | '+' expression %prec UPLUS {
      $$ = yy.uplus($2);
    }
  // | SUMIFS {
  //     $$ = yy.evaluateBySumifs($1);
  //   }
  | FUNCTION '(' ')' {
      $$ = yy.evaluateByFunction($1);
    }
  | FUNCTION '(' parameter ')' {
      $$ = yy.evaluateByFunction($1, $3);
    }
  /* | error
  | error error */
;

parameter
  : expression {
      $$ = [$1];
    }
  /* | ARRAY {
      $$ = yy.trimEdges(yytext).split(',');
    } */
  | parameter ',' expression {
      $1.push($3);
      $$ = $1;
    }
;

number
  : NUMBER {
      $$ = $1;
    }
  | NUMBER DECIMAL NUMBER {
      $$ = $1 + '.' + $3;
    }
;

%%
