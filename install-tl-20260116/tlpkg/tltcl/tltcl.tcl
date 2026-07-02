#!/usr/bin/env wish

# Copyright 2018-2025 Siep Kroonenberg

# This file is licensed under the GNU General Public License version 2
# or any later version.

# common declarations for tlshell.tcl and install-tl-gui.tcl

set ::plain_unix 0
if {$::tcl_platform(platform) eq "unix" &&
  [string range $::tcl_version 0 1] eq "8." && $::tcl_platform(os) ne "Darwin"} {
  set ::plain_unix 1
}

if $::plain_unix {
  # plain_unix: avoid a RenderBadPicture error on quitting.
  # 'send' changes the shutdown sequence,
  # which avoids triggering the bug.
  # 'tk appname <something>' restores 'send' and avoids the bug
  bind . <Destroy> {
    catch {tk appname appname}
  }
}

# process ID of the perl program that will run in the background
set ::perlpid 0

# mirrors

set any_mirror "https://mirror.ctan.org/systems/texlive/tlnet"

# turn name into a string suitable for a widget name
proc mangle_name {n} {
  set n [string tolower $n]
  set n [string map {" "  "_"} $n]
  return $n
} ; # mangle_name

set mirrors [dict create]
proc read_mirrors {} {
  if [catch {open [file join $::instroot \
                   "tlpkg/installer/ctan-mirrors.pl"] r} fm] {
    return 0
  }
  set re_geo {^\s*'([^']+)' => \{\s*$}
  set re_url {^\s*'(.*)' => ([0-9]+)}
  set re_clo {^\s*\},?\s*$}
  set starting 1
  set lnum 0 ; # line number for error messages
  set ok 1 ; # no errors encountered yet
  set countries {} ; # aggregate list of countries
  set urls {} ; # aggregate list of urls
  set continent ""
  set country ""
  set u ""
  set in_cont 0
  set in_coun 0
  while {! [catch {chan gets $fm} line] && ! [chan eof $fm]} {
    incr lnum
    if $starting {
      if {[string first "\$mirrors =" $line] == 0} {
        set starting 0
        continue
      } else {
        set ok 0
        set msg "Unexpected line '$line' at start"
        break
      }
    }
    # starting is now dealt with.
    if [regexp $re_geo $line dummy c] {
      if {! $in_cont} {
        set in_cont 1
        set continent $c
        set cont_dict [dict create]
        if {$continent in [dict keys $::mirrors]} {
          set ok 0
          set msg "Duplicate continent $c at line $lnum"
          break
        }
      } elseif {! $in_coun} {
        set in_coun 1
        set country $c
        if {$country in $countries} {
          set ok 0
          set msg "Duplicate country $c at line $lnum"
          break
        }
        lappend countries $country
        dict set cont_dict $country {}
      } else {
        set ok 0
        set msg "Unexpected continent- or country line $line at line $lnum"
        break
      }
    } elseif [regexp $re_url $line dummy u n] {
      if {! $in_coun} {
        set ok 0
        set msg "Unexpected url line $line at line $lnum"
        break
      } elseif {$n ne "1"} {
        continue
      }
      append u "systems/texlive/tlnet"
      if {$u in $urls} {
          set ok 0
          set msg "Duplicate url $u at line $lnum"
          break
      }
      dict lappend cont_dict $country $u
      lappend urls $u
      set u ""
    } elseif [regexp $re_clo $line] {
      if $in_coun {
        set in_coun 0
        set country ""
      } elseif $in_cont {
        set in_cont 0
        dict set ::mirrors $continent $cont_dict
        set continent ""
      } else {
        break ; # should close mirror list
      }
    } ; # ignore other lines
  }
  close $fm
} ; # read_mirrors

# cascading dropdown mirror menu
# parameter cmd should be a proc which does something with the selected url
proc mirror_menu {wnd cmd} {
  destroy $wnd.m
  if {[dict size $::mirrors] == 0} read_mirrors
  if {[dict size $::mirrors] > 0} {
    ttk::menubutton $wnd -text [__ "Specific mirror..."] \
        -direction below -menu $wnd.m
    menu $wnd.m
    dict for {cont d_cont} $::mirrors {
      set c_ed [mangle_name $cont]
      menu $wnd.m.$c_ed
      $wnd.m add cascade -label $cont -menu $wnd.m.$c_ed
      dict for {cntr urls} $d_cont {
        set n_ed [mangle_name $cntr]
        menu $wnd.m.$c_ed.$n_ed
        $wnd.m.$c_ed add cascade -label $cntr -menu $wnd.m.$c_ed.$n_ed
        foreach u $urls {
          $wnd.m.$c_ed.$n_ed add command -label $u -command "$cmd $u"
        }
      }
    }
  } else {
    ttk::label $wnd -text [__ "No mirror list available"]
  }
  return $wnd
}

proc possible_repository {s} {
  if [regexp {^(https?|ftp|scp|ssh):\/\/.+} $s] {return 1}
  if {[string first {file://} $s] == 0} {set s [string range $s 7 end]}
  if [file isdirectory [file join $s "archive"]] {return 1}
  if [file isdirectory [file join $s "texmf-dist/web2c"]] {return 1}
  return 0
}

proc get_stacktrace {} {
  set level [info level]
  set s ""
  for {set i 1} {$i < $level} {incr i} {
    append s [format "Level %u: %s\n" $i [info level $i]]
  }
  return $s
} ; # get_stacktrace

proc normalize_argv {} {
  # work back to front, to not disturb indices of unscanned list elements
  set i $::argc
  while 1 {
    incr i -1
    if {$i<0} break
    set s [lindex $::argv $i]
    if {[string range $s 0 1] eq "--"} {
      set s [string range $s 1 end]
      lset ::argv $i $s
    }
    set j [string first "=" $s]
    if {$j > 0} {
      set s0 [string range $s 0 [expr {$j-1}]]
      set s1 [string range $s [expr {$j+1}] end]
      set ::argv [lreplace $::argv $i $i $s0 $s1]
    } elseif {$j==0} {
      err_exit "Command-line argument $s starting with \"=\""
    } ; # else leave alone
  }
  set ::argc [llength $::argv]
}
normalize_argv

# set width of a treeview column wide enough
# to fully display all entries
proc set_tree_col_width {tv cl} {
  set len 0
  foreach c [$tv children {}] {
    # '<pathname> set <item> <column>' without a value parameter
    # is really a get.
    # Tree cells are  set to use TkDefaultFont redo_fonts further down.
    set l [font measure TkDefaultFont [$tv set $c $cl]]
    if {$l > $len} {set len $l}
  }
  $tv column $cl -width [expr {$len+10}]
}

# localization support

# for the sake of our translators we use our own translation function
# which can use .po files directly. This allows them to check their work
# without creating or waiting for a conversion to .msg.
# We still use the msgcat module for detecting default locale.
# Otherwise, the localization code borrows much from Norbert Preining's
# translation module for TL.

package require msgcat

# available languages
set ::langs [list "en"]
foreach l [glob -nocomplain -directory \
               [file join $::instroot "tlpkg" "translations"] *.po] {
  lappend ::langs [string range [file tail $l] 0 end-3]
}

proc initialize_language {} {
  # check the command-line for a lang parameter
  set ::lang ""
  set i 0
  while {$i < $::argc} {
    set p [lindex $::argv $i]
    incr i
    if {$p eq "-lang" || $p eq "-gui-lang"} {
      if {$i < $::argc} {
        set ::lang [lindex $::argv $i]
        break
      }
    }
  }
  unset i

  # First fallback, only for tlshell: check tlmgr config file
  if {$::lang eq "" && [info exists ::invoker] && $::invoker eq "tlshell"} {
    set ::lang [get_config_var "gui-lang"]
  }

  # try to set tcltk's locale to $::lang too. this may not work for 8.5.
  if {$::lang ne ""} {::msgcat::mclocale $::lang}

  # second fallback: what does msgcat think about it? Note that
  # msgcat checks the environment and on windows also the registry.
  if {$::lang eq ""} {set ::lang [::msgcat::mclocale]}

  set messcat ""
  if {$::lang ne ""} {
    set messcat ""
    set maybe ""
    set ::lang [string tolower $::lang]
    set tdir [file join $::instroot "tlpkg" "translations"]
    foreach f [glob -nocomplain -directory $tdir *.po] {
      set ln_f [string tolower [string range [file tail $f] 0 end-3]]
      if {$ln_f eq $::lang} {
        set messcat $f
        break
      } elseif {[string range $ln_f 0 1] eq [string range $::lang 0 1]} {
        set maybe $f
      }
    }
    if {$messcat eq "" && $maybe ne ""} {
      set ::lang [string tolower [string range [file tail $maybe] 0 end-3]]
    }
  }
}
initialize_language

proc load_translations {} {
  array unset ::TRANS
  if {$::lang eq ""} return
  set messcat [file join $::instroot "tlpkg" "translations" "${::lang}.po"]
  # parse messcat.
  # skip lines which make no sense
  if [file exists $messcat] {
    # create array with msgid keys and msgstr values
    # in the case that we switch languages,
    # we need to remove old translations,
    # since the new set may not completely cover the old one
    if {! [catch {open $messcat r} fid]} {
      fconfigure $fid -encoding utf-8
      set inmsgid 0
      set inmsgstr 0
      set msgid ""
      set msgstr ""
      while 1 {
        if [chan eof $fid] break
        if [catch {chan gets $fid} l] break
        if [regexp {^\s*#} $l] continue
        if [regexp {^\s*$} $l] {
          # empty line separates msgid/msgstr pairs
          if $inmsgid {
            # msgstr lines missing
            # puts stderr "no translation for $msgid in $messcat"
            set msgid ""
            set msgstr ""
            set inmsgid 0
            set inmsgstr 0
            continue
          }
          if $inmsgstr {
            # empty line signals end of msgstr
            if {$msgstr ne ""} {
              # unescape some characters
              set msgid [string map {{\n} "\n"} $msgid]
              set msgstr [string map {{\n} "\n"} $msgstr]
              set msgid [string map {{\\} "\\"} $msgid]
              set msgstr [string map {{\\} "\\"} $msgstr]
              set msgid [string map {{\"} "\""} $msgid]
              set msgstr [string map {{\"} "\""} $msgstr]
              set ::TRANS($msgid) $msgstr
            }
            set msgid ""
            set msgstr ""
            set inmsgid 0
            set inmsgstr 0
            continue
          }
          continue
        } ; # empty line
        if [regexp {^msgid\s+"(.*)"\s*$} $l m msgid] {
          # note. a failed match will leave msgid alone
          set inmsgid 1
          continue
        }
        if [regexp {^"(.*)"\s*$} $l m s] {
          if $inmsgid {
            append msgid $s
          } elseif $inmsgstr {
            append msgstr $s
          }
          continue
        }
        if [regexp {^msgstr\s+"(.*)"\s*$} $l m msgstr] {
          set inmsgstr 1
          set inmsgid 0
        }
      }
      chan close $fid
    }
  }
}
load_translations

proc __ {s args} {
  if {[info exists ::TRANS($s)]} {
    set s $::TRANS($s)
  #} else {
  #  puts stderr "No translation found for $s\n[get_stacktrace]"
  }
  if {$args eq ""} {
    return $s
  } else {
    return [format $s {*}$args]
  }
}

# string representation of booleans
proc yes_no {b} {
  if $b {
    set ans [__ "Yes"]
  } else {
    set ans [__ "No"]
  }
  return $ans
}

# avoid warnings from tar and perl about locale
set ::env(LC_ALL) "C"
unset -nocomplain ::env(LANG)
unset -nocomplain ::env(LANGUAGE)

### fonts ###

# ttk defaults use TkDefaultFont and TkHeadingFont
# ttk classic theme also uses TkTextFont for TEntry
# ttk::combobox uses TkTextFont
# although only the first three appear to be used here, this may depend
# on the theme, so I resize all symbolic fonts anyway.

set dflfonts [list \
  TkHeadingFont \
  TkCaptionFont \
  TkDefaultFont \
  TkMenuFont \
  TkTextFont \
  TkTooltipFont \
  TkFixedFont \
  TkIconFont \
  TkSmallCaptionFont \
]
foreach f $::dflfonts {
  set ::oldsize($f) [font configure $f -size]
}

font create bfont
font create lfont
font create hfont
font create titlefont

proc redo_fonts {} {

  # note that ttk styles refer to the above symbolic font names
  # and do not define fonts themselves

  foreach f $::dflfonts {
    font configure $f -size [expr { round($::oldsize($f)*$::tkfontscale)}]
  }
  # the above works for ttk::*button, ttk::treeview, notebook labels
  unset -nocomplain f

  option add *font TkDefaultFont
  # the above works for menu items, ttk::label, text, ttk::entry
  # including current value of ttk::combobox, ttk::combobox list items
  # and non-ttk labels and buttons - which are not used here
  # apparently, these widget classes use the X11 default font on Linux.

  set ::cw \
    [expr {max([font measure TkDefaultFont "0"],[font measure TkTextFont "0"])}]
  # height: assume height == width*2
  # workaround for treeview on windows on HiDPI displays
  ttk::style configure Treeview -rowheight [expr {3 * $::cw}]
  ttk::style configure Cell -font TkDefaultFont

  # no bold text for messages; `userDefault' indicates priority
  option add *Dialog.msg.font TkDefaultFont userDefault

  # normal size bold
  font configure bfont {*}[font configure TkDefaultFont]
  font configure bfont -weight bold
  # larger, not bold: lfont
  font configure lfont {*}[font configure TkDefaultFont]
  font configure lfont -size [expr {round(1.2 * [font actual lfont -size])}]
  # larger and bold
  font configure hfont {*}[font configure lfont]
  font configure hfont -weight bold
  # extra large and bold
  font configure titlefont {*}[font configure TkDefaultFont]
  font configure titlefont -weight bold \
      -size [expr {round(1.5 * [font actual titlefont -size])}]

  if $::plain_unix {
    ttk::setTheme default ; # or classic.
    # the settings below do not work right with clam and alt themes.
    ttk::style configure TCombobox -arrowsize [expr {1.5*$::cw}]
    ttk::style configure Item -indicatorsize [expr {1.5*$::cw}]
  }
}

# initialize scaling factor

set ::tkfontscale ""
if {[info exists ::invoker] && $::invoker eq "tlshell"} {
  set ::tkfontscale [get_config_var "tkfontscale"]
  # is $::tkfontscale a number, and a reasonable one?
  if {[scan $::tkfontscale {%f} f] != 1} { ; # not a number
    set ::tkfontscale ""
  } elseif {$::tkfontscale < 0} {
    set ::tkfontscale ""
  } elseif {$::tkfontscale < 0.5} {
    set ::tkfontscale 0.5
  } elseif {$::tkfontscale > 10} {
    set ::tkfontscale 10
  }
}
# most systems with a HiDPI display will be configured for it.
# set therefore the default simply to 1.
# users still have the option to scale fonts via the menu.
if {$::tkfontscale eq ""} {set ::tkfontscale 1}
redo_fonts

# icon
catch {
  image create photo tl_logo -file \
      [file join $::instroot "tlpkg" "tltcl" "tlmgr.gif"]
  wm iconphoto . -default tl_logo
}

# default foreground color and disabled foreground color
# may not be black in e.g. dark color schemes
set blk [ttk::style lookup TButton -foreground]
set gry [ttk::style lookup TButton -foreground disabled]

# 'default' padding

proc ppack {wdg args} { ; # pack command with padding
  pack $wdg {*}$args -padx 3p -pady 3p
}

proc pgrid {wdg args} { ; # grid command with padding
  grid $wdg {*}$args -padx 3p -pady 3p
}

# unicode symbols as fake checkboxes in ttk::treeview widgets

proc mark_sym {mrk} {
  if {$::tcl_platform(platform) eq "windows"} {
    # under windows, these look slightly better than
    # the non-windows selections
    if $mrk {
      return "\u2714" ; # 'heavy check mark'
    } else {
      return "\u25CB" ; # 'white circle'
    }
  } else {
    if $mrk {
      return "\u25A3" ; # 'white square containing black small square'
    } else {
      return "\u25A1" ; # 'white square'
    }
  }
} ; # mark_sym

# for help output
set ::env(NOPERLDOC) 1

##### dialog support #####

# for example code, look at dialog.tcl, part of Tk itself

# In most cases, it is not necessary to explicitly define a handler for
# the WM_DELETE_WINDOW protocol. But if the cancel- or abort button would do
# anything special, then the close icon should not bypass this.

# widget classes which can be enabled and disabled.
# The text widget class is not included here.

set ::active_cls [list TButton TCheckbutton TRadiobutton TEntry Treeview]

# global variable for dialog return value, in case the outcome
# must be handled by the caller rather than by the dialog itself:
set ::dialog_ans {}

# start new toplevel with settings appropriate for a dialog
proc create_dlg {wnd {p .}} {
  unset -nocomplain ::dialog_ans
  catch {destroy $wnd} ; # no error if it does not exist
  toplevel $wnd -class Dialog
  wm withdraw $wnd
  if [winfo viewable $p] {wm transient $wnd $p}
  if $::plain_unix {wm attributes $wnd -type dialog}
}

# Place a dialog centered wrt its parent.
# If its geometry is somehow not yet available,
# its upperleft corner will be centered.

proc place_dlg {wnd {p "."}} {
  update idletasks
  set g [wm geometry $p]
  scan $g "%dx%d+%d+%d" pw ph px py
  set hcenter [expr {$px + $pw / 2}]
  set vcenter [expr {$py + $ph / 2}]
  set g [wm geometry $wnd]
  set wh [winfo reqheight $wnd]
  set ww [winfo reqwidth $wnd]
  set wx [expr {$hcenter - $ww / 2}]
  if {$wx < 0} { set wx 0}
  set wy [expr {$vcenter - $wh / 2}]
  if {$wy < 0} { set wy 0}
  wm geometry $wnd [format "+%d+%d" $wx $wy]
  update idletasks
  wm state $wnd normal
  raise $wnd $p
  tkwait visibility $wnd
  focus $wnd
  grab set $wnd
} ; # place_dlg

# in case pressing the closing button leads to lengthy processing:
proc disable_dlg {wnd} {
  foreach c [winfo children $wnd] {
    if {[winfo class $c] in $::active_cls} {
      catch {$c state disabled}
    }
  }
}

proc end_dlg {ans wnd} {
  set ::dialog_ans $ans
  set p [winfo parent $wnd]
  if {$p eq ""} {set p "."}
  raise $p
  destroy $wnd
} ; # end_dlg

# a possibly useful callback for WM_DELETE_WINDOW
proc cancel_or_destroy {ctrl topl} {
  if [winfo exists $ctrl] {
    $ctrl invoke
  } elseif [winfo exists $topl] {
    destroy $topl
  }
}

##### directories #####

# slash flipping
proc forward_slashify {s} {
  regsub -all {\\} $s {/} r
  return $r
}
proc native_slashify {s} {
  if {$::tcl_platform(platform) eq "windows"} {
    regsub -all {/} $s {\\} r
  } else {
    regsub -all {\\} $s {/} r
  }
  return $r
}

# test whether a directory is writable.
# 'file writable' merely tests permissions, which may not be good enough
proc dir_writable {d} {
  for {set x 0} {$x<100} {incr x} {
    set y [expr {int(10000*rand())}]
    set newfile [file join $d $y]
    if [file exists $newfile] {
      continue
    } else {
      if [catch {open $newfile w} fid] {
        return 0
      } else {
        chan puts $fid "hello"
        chan close $fid
        if [file exists $newfile] {
          file delete $newfile
          return 1
        } else {
          return 0
        }
      }
    }
  }
  return 0
}

# unix: choose_dir replacing native directory browser.
# the native FILE browser is ok, though.

if {$::tcl_platform(platform) eq "unix"} {

  # Based on the directory browser from the tcl/tk widget demo.
  # Also for MacOS, because we want to see /usr.
  # For windows, the native browser widget is better.

  ## Code to populate a single directory node
  proc populateTree {tree node} {
    if {[$tree set $node type] ne "directory"} {
      set type [$tree set $node type]
      return
    }
    $tree delete [$tree children $node]
    foreach f [lsort [glob -nocomplain -directory $node *]] {
      set type [file type $f]
      if {$type eq "directory"} {
        $tree insert $node end \
            -id $f -text [file tail $f] -values [list $type]
        # Need at least one child to make this node openable,
        # will be deleted when actually populating this node
        $tree insert $f 0 -text "dummy"
      }
    }
    # Stop this code from rerunning on the current node
    $tree set $node type processedDirectory
  }

  proc choose_dir {initdir {parent .}} {

    create_dlg .browser $parent
    wm title .browser [__ "Browse..."]

    # wallpaper
    pack [ttk::frame .browser.bg -padding 3p] -fill both -expand 1

    # ok and cancel buttons
    pack [ttk::frame .browser.fr1] \
        -in .browser.bg -side bottom -fill x
    ppack [ttk::button .browser.ok -text [__ "Ok"]] \
        -in .browser.fr1 -side right
    ppack [ttk::button .browser.cancel -text [__ "Cancel"]] \
        -in .browser.fr1 -side right
    bind .browser <Escape> {.browser.cancel invoke}
    wm protocol .browser WM_DELETE_WINDOW \
        {cancel_or_destroy .browser.cancel .browser}
    .browser.ok configure -command {
      set ::dialog_ans [.browser.tree focus]
      destroy .browser
    }
    .browser.cancel configure -command {
      set ::dialog_ans ""
      destroy .browser
    }

    ## Create the tree and set it up
    pack [ttk::frame .browser.fr0] -in .browser.bg -fill both -expand 1
    set tree [ttk::treeview .browser.tree \
                  -columns {type} -displaycolumns {} -selectmode browse \
                  -yscroll ".browser.vsb set"]
    .browser.tree column 0 -stretch 1
    ttk::scrollbar .browser.vsb -orient vertical -command "$tree yview"
    # hor. scrolling does not work, but toplevel and widget are resizable
    $tree heading \#0 -text "/"
    $tree insert {} end -id "/" -text "/" -values [list "directory"]

    populateTree $tree "/"
    bind $tree <<TreeviewOpen>> {
      populateTree %W [%W focus]
    }
    bind $tree <ButtonRelease-1> {
      .browser.tree heading \#0 -text [%W focus]
    }

    ## Arrange the tree and its scrollbar in the toplevel
    # Horizontal scrolling does not work, but resizing does.
    grid $tree -in .browser.fr0 -row 0 -column 0 -sticky nsew
    grid .browser.vsb -in .browser.fr0 -row 0 -column 1 -sticky ns
    grid columnconfigure .browser.fr0 0 -weight 1
    grid rowconfigure .browser.fr0 0 -weight 1
    unset -nocomplain ::dialog_ans

    # navigate tree to $initdir
    set chosenDir {}
    foreach d [file split [file normalize $initdir]] {
      set nextdir [file join $chosenDir $d]
      if [file isdirectory $nextdir] {
        if {! [$tree exists $nextdir]} {
          $tree insert $chosenDir end -id $nextdir \
              -text $d -values [list "directory"]
        }
        populateTree $tree $nextdir
        set chosenDir $nextdir
      } else {
        break
      }
    }
    $tree see $chosenDir
    $tree selection set [list $chosenDir]
    $tree focus $chosenDir
    $tree heading \#0 -text $chosenDir

    place_dlg .browser $parent
    tkwait window .browser
    return $::dialog_ans
  }; # choose_dir

}; # if unix

proc browse4dir {inidir {parent .}} {
  if {$::tcl_platform(platform) eq "unix"} {
    return [choose_dir $inidir $parent]
  } else {
    return [tk_chooseDirectory \
        -initialdir $inidir -title [__ "Select or type"] -parent $parent]
  }
} ; # browse4dir

# browse for a directory and store in entry- or label widget $w
proc dirbrowser2widget {w} {
  set wclass [winfo class $w]
  if {$wclass eq "Entry" || $wclass eq "TEntry"} {
    set is_entry 1
  } elseif {$wclass eq "Label" || $wclass eq "TLabel"} {
    set is_entry 0
  } else {
    err_exit "browse2widget invoked with unsupported widget class $wclass"
  }
  if $is_entry {
    set retval [$w get]
  } else {
    set retval [$w cget -text]
  }
  set retval [browse4dir $retval [winfo parent $w]]
  if {$retval eq ""} {
    return 0
  } else {
    if {$wclass eq "Entry" || $wclass eq "TEntry"} {
      $w delete 0 end
      $w insert 0 $retval
    } else {
      $w configure -text $retval
    }
    return 1
  }
}

#### Unicode check- and radiobuttons ####

# on unix/linux the original indicators are hard-coded as bitmaps,
# which cannot scale with the rest of the interface.
# the hack below replaces them with unicode characters, which are scaled
# along with other text.
# This is implemented by removing the original indicators and prepending
# a unicode symbol and a unicode wide space to the text label.

# The combobox down arrow and the treeview triangles (directory browser)
# are scaled by normal style options at the end of redo_fonts.

if $::plain_unix {

  # from General Punctuation, 2000-206f
  set ::wsp \u2001 ; # wide space

  # from Geometric Shapes, 25a0-25ff
  set ::chk0 \u25a1
  set ::chk1 \u25a3
  set ::rad0 \u25cb
  set ::rad1 \u25c9

  # layouts copied from default theme, with indicator removed
  ttk::style layout TCheckbutton "Checkbutton.padding -sticky nswe -children {Checkbutton.focus -side left -sticky w -children {Checkbutton.label -sticky nswe}}"
  ttk::style layout TRadiobutton "Radiobutton.padding -sticky nswe -children {Radiobutton.focus -side left -sticky w -children {Radiobutton.label -sticky nswe}}"

  proc tlupdate_check {w n e o} { ; # n, e, o added to keep trace happy
    upvar [$w cget -variable] v
    set s [$w cget -text]
    set ck [expr {$v ? $::chk1 : $::chk0}]
    set s0 [string index $s 0]
    if {$s0 eq $::chk0 || $s0 eq $::chk1} {
      set s "$ck$::wsp[string range $s 2 end]"
    } else {
      set s "$ck$::wsp$s"
    }
    if {[string length $s] == 2} {
      # indicator plus wide space plus empty string. Remove wide space.
      set s [string range $s 0 0]
    }
    $w configure -text $s
  }
  bind TCheckbutton <Map> {+tlupdate_check %W n e o}
  bind TCheckbutton <Map> {+trace add variable [%W cget -variable] write \
                               [list tlupdate_check %W]}
  bind TCheckbutton <Unmap> \
    {+trace remove variable [%W cget -variable] write [list tlupdate_check %W]}

  proc tlupdate_radio {w n e o} {
    upvar [$w cget -variable] v
    set ck [expr {$v eq [$w cget -value] ? $::rad1 : $::rad0}]
    set s [$w cget -text]
    set s0 [string index $s 0]
    if {$s0 eq $::rad0 || $s0 eq $::rad1} {
      set s "$ck$::wsp[string range $s 2 end]"
    } else {
      set s "$ck$::wsp$s"
    }
    if {[string length $s] == 2} {
      # indicator plus wide space plus empty string. Remove wide space.
      set s [string range $s 0 0]
    }
    $w configure -text $s
  }

  bind TRadiobutton <Map> {+tlupdate_radio %W n e o}
  bind TRadiobutton <Map> {+trace add variable [%W cget -variable] write \
                               [list tlupdate_radio %W]}
  bind TRadiobutton <Unmap> \
    {+trace remove variable [%W cget -variable] write [list tlupdate_radio %W]}
}
