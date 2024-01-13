const perseSkills = require("../perseCommands.js");

test("PerseSkillTest", () => {
	var skills = perseSkills("1d100<={SAN} 【正気度ロール】\nCCB<=60 【アイデア】\nCCB<=60 【幸運】\nCCB<=30 【知識】\nCCB<=25 【目星】\nCCB<=25 【聞き耳】\nCCB<=25 【図書館】\nCCB<=30 【回避】\nCCB<=50 【こぶし（パンチ）】\nCCB<=30 【キック】\nCCB<=25 【忍び歩き】\nCCB<=50 【製作（ねこまんま）】\nCCB<=65 【跳躍】\nCCB<=25 【ナビゲート】\nCCB<=25 【言いくるめ】\nCCB<=8 【値切り】\nCCB<=35 【母国語（日本語）】\nCCB<=15 【猫魔人語】\nCCB<=6 【医学】\nCCB<=30 【化学】\nCCB<=55 【芸術（TRPG）】\nCCB<=5 【コンピューター】\nCCB<=6 【心理学】\nCCB<=2 【人類学】\nCCB<=2 【生物学】\nCCB<=2 【地質学】\nCCB<=2 【電子工学】\nCCB<=2 【天文学】\nCCB<=80 【おひるね】\n1d3-1D4 【ダメージ判定】\n1d4-1D4 【ダメージ判定】\n1d6-1D4 【ダメージ判定】\nCCB<={STR}*5 【STR × 5】\nCCB<={CON}*5 【CON × 5】\nCCB<={POW}*5 【POW × 5】\nCCB<={DEX}*5 【DEX × 5】\nCCB<={APP}*5 【APP × 5】\nCCB<={SIZ}*5 【SIZ × 5】\nCCB<={INT}*5 【INT × 5】\nCCB<={EDU}*5 【EDU × 5】\n");
	expect(skills[0]["label"]).toEqual("おひるね");
    expect(skills[0]["value"]).toEqual(80);
})