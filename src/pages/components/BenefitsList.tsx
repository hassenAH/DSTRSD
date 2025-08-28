import React from 'react';
import styles from './BenefitsList.module.scss';

interface BenefitsListProps {
    benefits: string[];
}

const BenefitsList: React.FC<BenefitsListProps> = ({ benefits }) => {
    const getBenefitItemClass = (index: number) => {
        switch (index) {
            case 0:
                return styles.benefitItem;
            case 1:
                return styles.benefitItem;
            case 2:
                return styles.benefitItemMedium;
            case 3:
                return styles.benefitItemLarge;
            case 4:
                return styles.benefitItem;
            default:
                return styles.benefitItem;
        }
    };

    const getBenefitTextClass = (index: number) => {
        switch (index) {
            case 0:
                return styles.earlyAccess;
            case 1:
                return styles.privateSales;
            case 2:
                return styles.specialGifts;
            case 3:
                return styles.personalInvitations;
            case 4:
                return styles.exclusiveContent;
            default:
                return '';
        }
    };

    return (
        <section className={styles.benefitsListContainer} aria-labelledby="benefits-heading">
            <ul className={styles.benefitsList} role="list">
                {benefits.map((benefit, index) => (
                    <li key={index} className={getBenefitItemClass(index)} role="listitem">
                        <span className={getBenefitTextClass(index)}>
                            {benefit}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default BenefitsList;
