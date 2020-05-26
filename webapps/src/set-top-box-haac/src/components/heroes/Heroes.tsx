import './Heroes.scss';

import {
	Footer,
	KeyCode,
	KeyEvent,
	NavigableButton,
	Preloadable,
	useActions,
	useAura,
	useBackground,
	useInput,
} from 'la-web-sdk';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuraCommands } from '../../../../common';

import { Hero } from './hero/Hero';



export const HeroesComponent = ({ onReady }: Preloadable) => {
	const aura = useAura();
	const background = useBackground();
	const [heroFocused, setHeroFocused] = useState<boolean>(true);
	const [currentHero, setCurrentHero] = useState<number>(aura.getData().current);
	const data = useRef(aura.getData());

	// Send previous/next operations to Aura
	const onKeyPressed = useCallback((e: KeyEvent) => {
		switch (e.data.keyCode) {
			case KeyCode.KEY_LEFT:
				heroFocused && aura.sendCommand(AuraCommands.getPrevious());
				break;
			case KeyCode.KEY_RIGHT:
				heroFocused && aura.sendCommand(AuraCommands.getNext());
				break;
			case KeyCode.KEY_UP:
				!heroFocused && setHeroFocused(true);
				break;
			case KeyCode.KEY_DOWN:
				heroFocused && setHeroFocused(false);
				break;
		}

	}, [aura, heroFocused]);
	useInput(onKeyPressed);

	// Handle Aura actions
	const actionsHandler = useCallback((actions: any[]) => {
		if (actions && actions.length > 0) {
			const hasNewIndex = actions[0].parameters?.newIndex !== undefined;
			const newIndex = actions[0]?.parameters?.newIndex;
			switch (actions[0].name) {
				case "LIVING_APP.NEXT":
					setCurrentHero((old: number) => hasNewIndex ? newIndex : old + 1 % data.current.heroes.length);
					break;
				case "LIVING_APP.PREVIOUS":
					setCurrentHero((old: number) => hasNewIndex ? newIndex : (data.current.heroes.length + old - 1) % data.current.heroes.length);
					break;
			}
		}
	}, [setCurrentHero]);
	useActions(actionsHandler);

	// Update bg color whenever we switch heroes
	useEffect(() => {
		background.setBackgroundColor(data.current.heroes[currentHero].bgColor);
		// eslint-disable-next-line react-hooks/exhaustive-deps 
	}, [currentHero]);

	useEffect(() => {
		background.clearBackground();
		background.setBackgroundColor(data.current.heroes[currentHero].bgColor);
		console.log("onready");
		onReady();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const goBack = useCallback(() => {
		aura.sendCommand(AuraCommands.getBack());
	}, [aura]);

	const goToVillains = useCallback(() => {
		aura.sendCommand(AuraCommands.getVillains());
	}, [aura]);

	return (
		<div id="heroes-wrapper">
			{
				<Hero hero={data.current.heroes[currentHero]} current={currentHero} focused={heroFocused}/>
			}
			<Footer>
				<NavigableButton onClick={goBack} id='back-button' defaultClass='button' focusedClass='focused-button'>
					Atrás
				</NavigableButton>
				<NavigableButton onClick={goToVillains} id='villains-button' defaultClass='villains-button button'
					focusedClass='focused-button'>
					Ver Villanos
				</NavigableButton>
			</Footer>
		</div>
	)
}