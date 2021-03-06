prostoEscribir
==============

**Prosto Escribir** - простой JavaScript редактор BBcode.
Откуда такое название? Prosto - "просто", Escribir - "писать" на Испанском.

Домашняя страница разработчиков: http://prostoksi.com

.. image:: https://github.com/frol/prostoEscribir/raw/master/screenshot.png

.. contents::

Краткий обзор
=============

Сейчас доступны такие кнопки:

- Жирный
- Курсив
- Подчёркнутый шрифт
- Выравнивание по левому краю
- Выравнивание по правому краю
- Выравнивание по центру
- Выравнивание по ширине страницы
- Вставка ссылки
- Вставка изображение
- Списки
- Переключение в режим кода

Так же реализованы кнопки, которые на данный момент не проверены
(так как проект вырос из WYSIWYG-BBCODE), поэтому закомментированы в коде:

- Выбор цвета
- Вставка видео с YouTube
- Вставка смайлов

Горячие клавиши настроены для некоторых кнопок по умолчанию. Тулбар и языки полностью настроиваются!

Требования
==========

- jQuery 1.4.2+
- jQuery.outerHTML (http://yelotofu.com/labs/jquery/snippets/outerhtml/jquery.outerhtml.js - backup is in requirements folder)

Поддерживаемые браузеры
=======================

- FireFox 4.0+ (not tested on early versions, but should work fine)
- Google Chrome
- Opera
- IE 8+

Использование
=============

Простой пример::

    $(function() {
        var prostoEscribir = $('#book_content').prostoEscribir();
        $('#book_form').submit(function() {
            // Синхронизировать последнюю редактированную версию текста (из iframe или textarea) в textarea.
            prostoEscribir.doCheck();
        });
    });

Настройки
=========

prostoEscribir словарь опций:

- css_urls - список CSS файлов, которые необходимо подключать в iframe [по умолчанию: <пустой список>]
- lang - строка указывающая язык (Сейчас доступны только 'en', 'ru', вы можете добавить дополнительные языки в 'langs' папку) [по умолчанию: 'en']
- toolbar - строка указывающая название темы кнопок тулбара [по умолчанию: 'classic']
- path - место, где находятся папки 'langs' и 'toolbars' [по умолчанию: <путь к prostoEscribir.js>]

Разработка
==========

Синтаксис тулбара::

    {
        <button id>: {
            name: <button name>,
            title: <button help text>,
            [exec: <ContentEditable command string>,]
            [func: <member class method name which will be called>,]
            [hotkey: <hotkey function>]
        },
        . . .
    }

- name - данное название используется в аттрибуте class
- title - подсказка, которая будет показана при наведении на кнопку
- exec - если необходимо лишь выполнить встроенную execCommand команду, то нужно просто написать строку, например, 'JustifyLeft'
- func - название метода класса. который будет вызвал при нажатии на кнопку
- hotkey - функция, которая возвращает true в случае, если нажатая кнопка соответствует горячей клавише данной кнопки, по полученному объекту события и коду нажатой кнопки
