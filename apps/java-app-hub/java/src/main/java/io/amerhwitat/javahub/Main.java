package io.amerhwitat.javahub;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.net.URI;

public final class Main {
 private static final String[][] PROJECTS={
 {"general","Agent Research Forge; Workflow Studio; email and SEO tools","Partial","https://github.com/amerhwitat/general"},
 {"BizX","Asset Browser; Internet Scanner; Network Unified; Mobile Unified","Partial","https://github.com/amerhwitat/BizX"},
 {"BizXtreme","Unified Game; Network Unified; Asset Browser","Partial","https://github.com/amerhwitat/BizXtreme"},
 {"test","Chimera Python; Research App; web prototypes","Partial","https://github.com/amerhwitat/test"},
 {"VanG","Apple/mobile prototypes","Port candidate","https://github.com/amerhwitat/VanG"},
 {"eth-key-check","Ethereum key checking; CLI; web UI","Partial","https://github.com/amerhwitat/eth-key-check"},
 {"bruteforce","Security research utilities; CLI; web UI","Partial","https://github.com/amerhwitat/bruteforce"},
 {"keygen","Key generation tools","Java present","https://github.com/amerhwitat/keygen"},
 {"CPU4096","CPU architecture experiments; ISA tools","Partial","https://github.com/amerhwitat/CPU4096"},
 {"PDFreaderPY","PDF reader; Thamudic tools","Partial","https://github.com/amerhwitat/PDFreaderPY"},
 {"CPU4096Simulator","CPU simulator; machine-code execution","Partial","https://github.com/amerhwitat/CPU4096Simulator"},
 {"nlp","ThamudicScan; NLP Studio; Amiga and ISO tools","Partial","https://github.com/amerhwitat/nlp"},
 {"ChimeraIIOS","Koronos; Aurora; ISA registry; ISO and mobile tools","Partial","https://github.com/amerhwitat/ChimeraIIOS"},
 {"amerhwitat.github.io","Portfolio; Aurora web desktop; browser app suite","Web GUI + Java companion","https://github.com/amerhwitat/amerhwitat.github.io"},
 {"OctavianOS","Koronos integration; Aurora; Marine; mobile/microkernel","Partial","https://github.com/amerhwitat/OctavianOS"}};
 private Main(){}
 public static void main(String[] args){SwingUtilities.invokeLater(Main::showUi);}
 private static void showUi(){
  JFrame frame=new JFrame("Java Application Hub — Amer Hwitat");frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);frame.setMinimumSize(new Dimension(900,520));frame.setLayout(new BorderLayout(10,10));
  JLabel intro=new JLabel("<html><h1>Java Application Hub</h1>Repository inventory and staged Java migration tracker. Status labels do not imply complete feature parity.</html>");intro.setBorder(BorderFactory.createEmptyBorder(12,14,4,14));frame.add(intro,BorderLayout.NORTH);
  JTextField search=new JTextField();search.setToolTipText("Filter by repository, application area or Java status");
  DefaultTableModel model=new DefaultTableModel(new String[]{"Repository","Application areas","Java status","Source URL"},0){@Override public boolean isCellEditable(int r,int c){return false;}};
  JTable table=new JTable(model);table.setAutoCreateRowSorter(true);table.setFillsViewportHeight(true);
  Runnable refresh=()->{String q=search.getText().trim().toLowerCase();model.setRowCount(0);for(String[] p:PROJECTS){if(q.isEmpty()||String.join(" ",p).toLowerCase().contains(q))model.addRow(p);}};
  search.getDocument().addDocumentListener(new javax.swing.event.DocumentListener(){public void insertUpdate(javax.swing.event.DocumentEvent e){refresh.run();}public void removeUpdate(javax.swing.event.DocumentEvent e){refresh.run();}public void changedUpdate(javax.swing.event.DocumentEvent e){refresh.run();}});
  JPanel top=new JPanel(new BorderLayout(8,8));top.setBorder(BorderFactory.createEmptyBorder(0,14,8,14));top.add(new JLabel("Search"),BorderLayout.WEST);top.add(search,BorderLayout.CENTER);frame.add(top,BorderLayout.BEFORE_FIRST_LINE);frame.add(new JScrollPane(table),BorderLayout.CENTER);
  JButton open=new JButton("Open selected repository");open.addActionListener(e->{int vr=table.getSelectedRow();if(vr<0){JOptionPane.showMessageDialog(frame,"Select a repository first.");return;}int row=table.convertRowIndexToModel(vr);try{Desktop.getDesktop().browse(URI.create(String.valueOf(model.getValueAt(row,3))));}catch(Exception ex){JOptionPane.showMessageDialog(frame,"Could not open browser: "+ex.getMessage(),"Open repository",JOptionPane.ERROR_MESSAGE);}});
  JPanel bottom=new JPanel(new BorderLayout());bottom.add(new JLabel("  Static inventory · JVM desktop GUI · browser GUI published separately"),BorderLayout.CENTER);bottom.add(open,BorderLayout.EAST);bottom.setBorder(BorderFactory.createEmptyBorder(8,14,12,14));frame.add(bottom,BorderLayout.SOUTH);refresh.run();frame.setLocationRelativeTo(null);frame.setVisible(true);
 }
}
