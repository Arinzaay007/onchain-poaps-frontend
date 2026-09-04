s=open('tailwind.config.ts').read()
start=s.index('<<<<<<< HEAD')
end=s.index('>>>>>>>',start)+len('>>>>>>> 57842dd (Apply Design Arena design language across all tabs (explore/gallery/steward/docs/verify/poap/kiosk/footer): cool charcoal palette, vermilion wax accent, slate-blue soulbound, forest green)')
marker=s[end:end+1]
# The resolved block (my version), from the `=======` branch
block='''        // Brand colors — Design Arena palette (unchanged in both modes).
        accent: "#b23a2c",       // wax vermilion (primary red)
        accentdark: "#8a2a1f",   // pressed wax
        stamp: "#4a5d8c",        // slate-blue (soulbound)
        gold: "#a98a4b",         // antique gold
        mint: "#2f6b58",         // forest green (positive/allowlist/verify)
'''
# Extract the entire conflicted segment (three lines with markers) and replace with block
seg_start=start
# find end of conflict line's newline
seg_end=s.index('\n',end)+1
s2=s[:seg_start]+block+s2 if False else s[:seg_start]+block+s[seg_end:]
open('tailwind.config.ts','w').write(s2)
print("done")
