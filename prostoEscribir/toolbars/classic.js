PETOOLBAR = {
    bold: {name: 'bold', title: PELANG.bold, exec: 'bold',
        hotkey: function(e, key){ return e.ctrlKey && key == 98; }
    },
    italic: {name: 'italic', title: PELANG.italic, exec: 'italic',
        hotkey: function(e, key){ return e.ctrlKey && key == 105; }
    },
    underline: {name: 'underline', title: PELANG.underline, exec: 'underline',
        hotkey: function(e, key){ return e.ctrlKey && key == 117; }
    },
    align_left: {name: 'align_left', title: PELANG.align_left, exec: 'JustifyLeft',
        hotkey: function(e, key){ return e.ctrlKey && key == 108; }
    },
    align_right: {name: 'align_right', title: PELANG.align_right, exec: 'JustifyRight',
        hotkey: function(e, key){ return e.ctrlKey && key == 114; }
    },
    align_center: {name: 'align_center', title: PELANG.align_center, exec: 'JustifyCenter',
        hotkey: function(e, key){ return e.ctrlKey && key == 101; }
    },
    align_full: {name: 'align_full', title: PELANG.align_full, exec: 'JustifyFull'},
    link: {name: 'link', title: PELANG.link, func: 'link'},
    image: {name: 'image', title: PELANG.image, func: 'image'},
    lists: {name: 'lists', title: PELANG.lists, exec: 'InsertUnorderedList'},
    html: {name: 'html', title: PELANG.html, func: 'toggle'}
};
