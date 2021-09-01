#! /bin/sh
#play a sound with setting the volume before
amixer -D hw:0 cset numid=1 $1
mpg123 -q -a 0 $2
