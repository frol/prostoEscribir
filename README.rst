prostoEscribir
==============

**Prosto Escribir** is the JavaScript simple BBcode editor.
Name explanation: Prosto ("просто") - simple in Russian, Escribir - write in Spanish.

Developers team homepage: http://prostoksi.com

.. contents::

Quick overview
==============

There are available buttons:
 * Bold
 * Italic
 * Underline
 * Align left
 * Align right
 * Align center
 * Align justify
 * Insert link
 * Insert image
 * Unordered list
 * Switch to source

There are implemented buttons, but they are not tested, so commented in code:
 * Select color with color picker
 * Insert Youtube video
 * Insert smiles

Hotkeys work for some buttons. Toolbar and language are fully configurable!

Requirements
============

 * jQuery 1.4.2+
 * jQuery.outerHTML (http://yelotofu.com/labs/jquery/snippets/outerhtml/jquery.outerhtml.js - backup is in requirements folder)

Supported browsers
==================

 * FireFox 11.0+
 * Google Chrome
 * Opera
 * IE 8+

Usage
=====

Simple example::
    $(function() {
        var prostoEscribir = $('#book_content').prostoEscribir();
        $('#book_form').submit(function() {
            // Sync last edited text version into textarea.
            prostoEscribir.doCheck();
        });
    });

Settings
========

prostoEscribir options dict:
 * css_urls - list of css files, that need include in iframe [default: <empty>]
 * lang - language specifier string (Now available only 'en', 'ru', you can add additional languages into 'langs' folder) [default: 'en']
 * toolbar - dictionary of buttons [default: 'classic']
 * path - place where located 'langs' and 'toolbars' folders [default: <path with prostoEscribir.js>]

Toolbar syntax::
    {
        <button id>: {
            name: <button name>,
            title: <button help text>,
            [exec: <ContentEditable command string>,]
            [func: <function name from >,]
            [hotkey: <hotkey function>]
        },
        ...
    }
