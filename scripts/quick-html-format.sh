#!/bin/bash

IN="$1"
OUT="$2"

cat "$IN" | sed -e 's@>@>\n@g' | awk '
BEGIN {n=0; p=""; bo=0}
/<body>/ {bo=1}
bo==0 {print;next}
/^<\// {n = n-1;sub(/.$/, "", p)}
/<sp-slide/ { print ""; print "" }
{
  o=p;
  sub(/.$/, "", o);
  gsub(/ /, "  ", o);
  print o $0
}
/<[^/]/ {n = n+1; p = p " "}
/.<\// {n = n-1;sub(/.$/, "", p)}
' > "$OUT"
