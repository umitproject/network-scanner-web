<?xml version="1.0" ?>
<!--
 Copyright (C) 2007 Adriano Monteiro Marques <py.adriano@gmail.com>

 Author: Rodolfo da Silva Carvalho <rodolfo.ueg@gmail.com>

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <!-- ............................................................-->
    <xsl:variable name="start"><xsl:value-of select="/nmaprun/@startstr" /></xsl:variable>
    <xsl:variable name="end"><xsl:value-of select="/nmaprun/runstats/finished/@timestr" /> </xsl:variable>
    <xsl:variable name="totaltime"><xsl:value-of select="/nmaprun/runstats/finished/@time -/nmaprun/@start" /></xsl:variable>
    <!-- ............................................................ -->
    
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="/nmaprun">
        <html>
        <body>
            <h1>Nmap run!</h1>
            <div id="hosts">
                <ul>
            <xsl:for-each select="host">
                <li>
                <xsl:choose>
                    <xsl:when test="hostnames/host">
                        <xsl:value-of select="hostname/host"/>
                    </xsl:when>
                </xsl:choose>
               </li> 
            </xsl:for-each>
            </ul>
            </div>
        </body>
        </html>
    </xsl:template>
</xsl:stylesheet>